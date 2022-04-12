import {
  ApplicationPayload,
  ReduxAction,
  ReduxActionErrorTypes,
  ReduxActionTypes,
} from "constants/ReduxActionConstants";
import ApplicationApi, {
  ApplicationObject,
  ApplicationPagePayload,
  ChangeAppViewAccessRequest,
  CreateApplicationRequest,
  CreateApplicationResponse,
  DeleteApplicationRequest,
  DuplicateApplicationRequest,
  FetchUsersApplicationsOrgsResponse,
  ForkApplicationRequest,
  OrganizationApplicationObject,
  PublishApplicationRequest,
  PublishApplicationResponse,
  SetDefaultPageRequest,
  UpdateApplicationRequest,
  ImportApplicationRequest,
  FetchApplicationResponse,
  FetchApplicationPayload,
  ApplicationResponsePayload,
  FetchUnconfiguredDatasourceListResponse,
} from "api/ApplicationApi";
import { all, call, put, select, takeLatest } from "redux-saga/effects";

import { validateResponse } from "./ErrorSagas";
import { getUserApplicationsOrgsList } from "selectors/applicationSelectors";
import { ApiResponse } from "api/ApiResponses";
import history from "utils/history";
import {
  setDefaultApplicationPageSuccess,
  resetCurrentApplication,
  FetchApplicationPreviewPayload,
  fetchApplication,
  ApplicationVersion,
  initDatasourceConnectionDuringImportSuccess,
  importApplicationSuccess,
  setOrgIdForImport,
  setIsReconnectingDatasourcesModalOpen,
  getAllApplications,
  showReconnectDatasourceModal,
} from "actions/applicationActions";
import AnalyticsUtil from "utils/AnalyticsUtil";
import {
  createMessage,
  DELETING_APPLICATION,
  DUPLICATING_APPLICATION,
} from "@appsmith/constants/messages";
import { Toaster } from "components/ads/Toast";
import { APP_MODE } from "entities/App";
import { Organization } from "constants/orgConstants";
import { Variant } from "components/ads/common";
import { AppIconName } from "components/ads/AppIcon";
import { AppColorCode } from "constants/DefaultTheme";
import {
  getCurrentApplicationId,
  getCurrentPageId,
  selectURLSlugs,
} from "selectors/editorSelectors";

import {
  deleteRecentAppEntities,
  setPostWelcomeTourState,
} from "utils/storage";
import {
  reconnectAppLevelWebsocket,
  reconnectPageLevelWebsocket,
} from "actions/websocketActions";
import { getCurrentOrg } from "selectors/organizationSelectors";
import { Org } from "constants/orgConstants";
import { AppLayoutConfig } from "reducers/entityReducers/pageListReducer";

import {
  getCurrentStep,
  getEnableFirstTimeUserOnboarding,
  getFirstTimeUserOnboardingApplicationId,
  inGuidedTour,
} from "selectors/onboardingSelectors";
import { fetchPluginFormConfigs, fetchPlugins } from "actions/pluginActions";
import {
  fetchDatasources,
  setUnconfiguredDatasourcesDuringImport,
} from "actions/datasourceActions";
import { failFastApiCalls } from "./InitSagas";
import { Datasource } from "entities/Datasource";
import { GUIDED_TOUR_STEPS } from "pages/Editor/GuidedTour/constants";
import { PLACEHOLDER_APP_SLUG, PLACEHOLDER_PAGE_SLUG } from "constants/routes";
import { updateSlugNamesInURL } from "utils/helpers";
import { builderURL, generateTemplateURL, viewerURL } from "RouteBuilder";
import { getDefaultPageId as selectDefaultPageId } from "./selectors";
import PageApi from "api/PageApi";
import { identity, pickBy } from "lodash";
import { checkAndGetPluginFormConfigsSaga } from "./PluginSagas";
import { getPluginForm } from "selectors/entitiesSelector";
import { getConfigInitialValues } from "components/formControls/utils";
import { merge } from "lodash";
import DatasourcesApi from "api/DatasourcesApi";
import { AppState } from "reducers";

export const getDefaultPageId = (
  pages?: ApplicationPagePayload[],
): string | undefined => {
  let defaultPage: ApplicationPagePayload | undefined = undefined;
  if (pages) {
    defaultPage = pages.find((page) => page.isDefault);
    if (!defaultPage) {
      defaultPage = pages[0];
    }
  }
  return defaultPage ? defaultPage.id : undefined;
};

let windowReference: Window | null = null;

export function* publishApplicationSaga(
  requestAction: ReduxAction<PublishApplicationRequest>,
) {
  try {
    const request = requestAction.payload;
    const response: PublishApplicationResponse = yield call(
      ApplicationApi.publishApplication,
      request,
    );
    const isValidResponse = yield validateResponse(response);
    if (isValidResponse) {
      yield put({
        type: ReduxActionTypes.PUBLISH_APPLICATION_SUCCESS,
      });

      const applicationId: string = yield select(getCurrentApplicationId);
      const currentPageId: string = yield select(getCurrentPageId);
      const guidedTour: boolean = yield select(inGuidedTour);
      const currentStep: number = yield select(getCurrentStep);
      const { applicationSlug, pageSlug } = yield select(selectURLSlugs);

      let appicationViewPageUrl = viewerURL({
        applicationSlug,
        pageSlug,
        pageId: currentPageId,
      });
      if (guidedTour && currentStep === GUIDED_TOUR_STEPS.DEPLOY) {
        appicationViewPageUrl += "?&guidedTourComplete=true";
        yield call(setPostWelcomeTourState, true);
      }

      yield put(
        fetchApplication({
          applicationId,
          pageId: currentPageId,
          mode: APP_MODE.EDIT,
        }),
      );
      // If the tab is opened focus and reload else open in new tab
      if (!windowReference || windowReference.closed) {
        windowReference = window.open(appicationViewPageUrl, "_blank");
      } else {
        windowReference.focus();
        windowReference.location.href =
          windowReference.location.origin + appicationViewPageUrl;
      }
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.PUBLISH_APPLICATION_ERROR,
      payload: {
        error,
      },
    });
  }
}
export function* getAllApplicationSaga() {
  try {
    const response: FetchUsersApplicationsOrgsResponse = yield call(
      ApplicationApi.getAllApplication,
    );
    const isValidResponse = yield validateResponse(response);
    if (isValidResponse) {
      const organizationApplication: OrganizationApplicationObject[] = response.data.organizationApplications.map(
        (userOrgs: OrganizationApplicationObject) => ({
          organization: userOrgs.organization,
          userRoles: userOrgs.userRoles,
          applications: !userOrgs.applications
            ? []
            : userOrgs.applications.map((application: ApplicationObject) => {
                return {
                  ...application,
                  defaultPageId: getDefaultPageId(application.pages),
                };
              }),
        }),
      );

      yield put({
        type: ReduxActionTypes.FETCH_USER_APPLICATIONS_ORGS_SUCCESS,
        payload: organizationApplication,
      });
      const { newReleasesCount, releaseItems } = response.data || {};
      yield put({
        type: ReduxActionTypes.FETCH_RELEASES_SUCCESS,
        payload: { newReleasesCount, releaseItems },
      });
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.FETCH_USER_APPLICATIONS_ORGS_ERROR,
      payload: {
        error,
      },
    });
  }
}

export function* fetchAppAndPagesSaga(
  action: ReduxAction<FetchApplicationPayload>,
) {
  try {
    const params = pickBy(action.payload, identity);
    if (params.pageId && params.applicationId) {
      delete params.applicationId;
    }

    const response: FetchApplicationResponse = yield call(
      PageApi.fetchAppAndPages,
      params,
    );
    const isValidResponse: boolean = yield call(validateResponse, response);
    if (isValidResponse) {
      yield put({
        type: ReduxActionTypes.FETCH_APPLICATION_SUCCESS,
        payload: { ...response.data.application, pages: response.data.pages },
      });

      yield put({
        type: ReduxActionTypes.FETCH_PAGE_LIST_SUCCESS,
        payload: {
          pages: response.data.pages.map((page) => ({
            pageName: page.name,
            pageId: page.id,
            isDefault: page.isDefault,
            isHidden: !!page.isHidden,
            slug: page.slug,
          })),
          applicationId: response.data.application?.id,
        },
      });

      yield put({
        type: ReduxActionTypes.SET_CURRENT_ORG_ID,
        payload: {
          orgId: response.data.organizationId,
        },
      });

      yield put({
        type: ReduxActionTypes.SET_APP_VERSION_ON_WORKER,
        payload: response.data.application?.evaluationVersion,
      });
    } else {
      yield call(handleFetchApplicationError, response.responseMeta?.error);
    }
  } catch (error) {
    yield call(handleFetchApplicationError, error);
  }
}

function* handleFetchApplicationError(error: unknown) {
  yield put({
    type: ReduxActionErrorTypes.FETCH_APPLICATION_ERROR,
    payload: {
      error,
    },
  });
  yield put({
    type: ReduxActionErrorTypes.FETCH_PAGE_LIST_ERROR,
    payload: {
      error,
    },
  });
}

export function* setDefaultApplicationPageSaga(
  action: ReduxAction<SetDefaultPageRequest>,
) {
  try {
    const defaultPageId: string = yield select(selectDefaultPageId);
    if (defaultPageId !== action.payload.id) {
      const request: SetDefaultPageRequest = action.payload;
      const response: ApiResponse = yield call(
        ApplicationApi.setDefaultApplicationPage,
        request,
      );
      const isValidResponse = yield validateResponse(response);
      if (isValidResponse) {
        yield put(
          setDefaultApplicationPageSuccess(request.id, request.applicationId),
        );
      }
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.SET_DEFAULT_APPLICATION_PAGE_ERROR,
      payload: {
        error,
      },
    });
  }
}

function* updateApplicationLayoutSaga(
  action: ReduxAction<UpdateApplicationRequest>,
) {
  try {
    yield call(updateApplicationSaga, action);
    yield put({
      type: ReduxActionTypes.CURRENT_APPLICATION_LAYOUT_UPDATE,
      payload: action.payload.appLayout,
    });
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.UPDATE_APP_LAYOUT_ERROR,
      payload: {
        error,
      },
    });
  }
}

export function* updateApplicationSaga(
  action: ReduxAction<UpdateApplicationRequest>,
) {
  try {
    const request: UpdateApplicationRequest = action.payload;
    const response: ApiResponse = yield call(
      ApplicationApi.updateApplication,
      request,
    );
    const isValidResponse: boolean = yield validateResponse(response);
    // as the redux store updates the app only on success.
    // we have to run this
    if (isValidResponse) {
      if (request && request.applicationVersion) {
        if (request.applicationVersion === ApplicationVersion.SLUG_URL) {
          request.callback?.();
          return;
        }
      }
      if (request) {
        yield put({
          type: ReduxActionTypes.UPDATE_APPLICATION_SUCCESS,
          payload: action.payload,
        });
      }
      if (request.currentApp) {
        yield put({
          type: ReduxActionTypes.CURRENT_APPLICATION_NAME_UPDATE,
          payload: response.data,
        });
        updateSlugNamesInURL({
          applicationSlug: response.data.slug,
        });
      }
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.UPDATE_APPLICATION_ERROR,
      payload: {
        error,
      },
    });
  }
}

export function* deleteApplicationSaga(
  action: ReduxAction<DeleteApplicationRequest>,
) {
  try {
    Toaster.show({
      text: createMessage(DELETING_APPLICATION),
    });
    const request: DeleteApplicationRequest = action.payload;
    const response: ApiResponse = yield call(
      ApplicationApi.deleteApplication,
      request,
    );
    const isValidResponse: boolean = yield validateResponse(response);
    if (isValidResponse) {
      yield put({
        type: ReduxActionTypes.DELETE_APPLICATION_SUCCESS,
        payload: response.data,
      });
      yield call(deleteRecentAppEntities, request.applicationId);
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.DELETE_APPLICATION_ERROR,
      payload: {
        error,
      },
    });
  }
}

export function* duplicateApplicationSaga(
  action: ReduxAction<DeleteApplicationRequest>,
) {
  try {
    Toaster.show({
      text: createMessage(DUPLICATING_APPLICATION),
    });
    const request: DuplicateApplicationRequest = action.payload;
    const response: ApiResponse = yield call(
      ApplicationApi.duplicateApplication,
      request,
    );
    const isValidResponse = yield validateResponse(response);
    if (isValidResponse) {
      const application: ApplicationPayload = {
        ...response.data,
        defaultPageId: getDefaultPageId(response.data.pages),
      };
      yield put({
        type: ReduxActionTypes.DUPLICATE_APPLICATION_SUCCESS,
        payload: response.data,
      });
      const { slug } = application;
      const defaultPage = application.pages.find((page) => page.isDefault);
      const pageURL = builderURL({
        applicationVersion: application.applicationVersion,
        applicationId: application.id,
        applicationSlug: slug || PLACEHOLDER_APP_SLUG,
        pageSlug: defaultPage?.slug || PLACEHOLDER_PAGE_SLUG,
        pageId: application.defaultPageId as string,
      });
      history.push(pageURL);
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.DUPLICATE_APPLICATION_ERROR,
      payload: {
        error,
      },
    });
  }
}

export function* changeAppViewAccessSaga(
  requestAction: ReduxAction<ChangeAppViewAccessRequest>,
) {
  try {
    const request = requestAction.payload;
    const response: ApiResponse = yield call(
      ApplicationApi.changeAppViewAccess,
      request,
    );
    const isValidResponse: boolean = yield validateResponse(response);
    if (isValidResponse) {
      yield put({
        type: ReduxActionTypes.CHANGE_APPVIEW_ACCESS_SUCCESS,
        payload: {
          id: response.data.id,
          isPublic: response.data.isPublic,
        },
      });
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.CHANGE_APPVIEW_ACCESS_ERROR,
      payload: {
        error,
      },
    });
  }
}

export function* createApplicationSaga(
  action: ReduxAction<{
    applicationName: string;
    icon: AppIconName;
    color: AppColorCode;
    isMobile: boolean;
    orgId: string;
    resolve: any;
    reject: any;
  }>,
) {
  const {
    applicationName,
    color,
    icon,
    orgId,
    reject,
    isMobile,
  } = action.payload;
  try {
    const userOrgs = yield select(getUserApplicationsOrgsList);
    const existingOrgs = userOrgs.filter(
      (org: Organization) => org.organization.id === orgId,
    )[0];
    const existingApplication = existingOrgs
      ? existingOrgs.applications.find(
          (application: ApplicationPayload) =>
            application.name === applicationName,
        )
      : null;
    if (existingApplication) {
      yield call(reject, {
        _error: "应用名称被占用",
      });
      yield put({
        type: ReduxActionErrorTypes.CREATE_APPLICATION_ERROR,
        payload: {
          error: "应用创建失败",
          show: false,
        },
      });
    } else {
      yield put(resetCurrentApplication());

      const layout: AppLayoutConfig = {
        type: isMobile ? "MOBILE_FLUID" : "DESKTOP",
      };
      const request: CreateApplicationRequest = {
        name: applicationName,
        icon: icon,
        color: color,
        orgId,
        unpublishedAppLayout: layout,
        publishedAppLayout: layout,
      };
      const response: CreateApplicationResponse = yield call(
        ApplicationApi.createApplication,
        request,
      );
      const isValidResponse = yield validateResponse(response);
      if (isValidResponse) {
        const application: ApplicationPayload = {
          ...response.data,
          defaultPageId: getDefaultPageId(response.data.pages) as string,
        };
        AnalyticsUtil.logEvent("CREATE_APP", {
          appName: application.name,
          isMobile,
        });
        const defaultPage = response.data.pages.find((page) => page.isDefault);
        const defaultPageSlug = defaultPage?.slug || PLACEHOLDER_PAGE_SLUG;
        // This sets ui.pageWidgets = {} to ensure that
        // widgets are cleaned up from state before
        // finishing creating a new application
        yield put({
          type: ReduxActionTypes.RESET_APPLICATION_WIDGET_STATE_REQUEST,
        });
        yield put({
          type: ReduxActionTypes.CREATE_APPLICATION_SUCCESS,
          payload: {
            orgId,
            application,
          },
        });
        const isFirstTimeUserOnboardingEnabled = yield select(
          getEnableFirstTimeUserOnboarding,
        );
        const FirstTimeUserOnboardingApplicationId = yield select(
          getFirstTimeUserOnboardingApplicationId,
        );
        let pageURL;

        if (
          isFirstTimeUserOnboardingEnabled &&
          FirstTimeUserOnboardingApplicationId === ""
        ) {
          yield put({
            type:
              ReduxActionTypes.SET_FIRST_TIME_USER_ONBOARDING_APPLICATION_ID,
            payload: application.id,
          });
          pageURL = builderURL({
            applicationId: application.id,
            applicationVersion: application.applicationVersion,
            applicationSlug: application.slug as string,
            pageSlug: defaultPageSlug,
            pageId: application.defaultPageId as string,
            isMobile,
          });
        } else {
          pageURL = generateTemplateURL({
            applicationId: application.id,
            applicationVersion: application.applicationVersion,
            applicationSlug: application.slug as string,
            pageSlug: defaultPageSlug,
            pageId: application.defaultPageId as string,
            isMobile,
          });
        }
        history.push(pageURL);

        // subscribe to newly created application
        // users join rooms on connection, so reconnecting
        // ensures user receives the updates in the app just created
        yield put(reconnectAppLevelWebsocket());
        yield put(reconnectPageLevelWebsocket());
      }
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.CREATE_APPLICATION_ERROR,
      payload: {
        error,
        show: false,
        orgId,
      },
    });
  }
}

export function* forkApplicationSaga(
  action: ReduxAction<ForkApplicationRequest>,
) {
  try {
    const response: ApiResponse = yield call(
      ApplicationApi.forkApplication,
      action.payload,
    );
    const isValidResponse = yield validateResponse(response);
    if (isValidResponse) {
      yield put(resetCurrentApplication());
      const application: ApplicationPayload = {
        ...response.data,
        defaultPageId: getDefaultPageId(response.data.pages),
      };
      yield put({
        type: ReduxActionTypes.FORK_APPLICATION_SUCCESS,
        payload: {
          orgId: action.payload.organizationId,
          application,
        },
      });
      const defaultPage = response.data.pages.find(
        (page: ApplicationPagePayload) => page.isDefault,
      );
      const pageURL = builderURL({
        applicationVersion: application.applicationVersion,
        applicationId: application.id,
        applicationSlug: application.slug || PLACEHOLDER_APP_SLUG,
        pageSlug: defaultPage.slug || PLACEHOLDER_PAGE_SLUG,
        pageId: application.defaultPageId as string,
      });
      history.push(pageURL);
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.FORK_APPLICATION_ERROR,
      payload: {
        error,
      },
    });
  }
}

function* showReconnectDatasourcesModalSaga(
  action: ReduxAction<{
    application: ApplicationResponsePayload;
    unConfiguredDatasourceList: Array<Datasource>;
    orgId: string;
  }>,
) {
  const { application, orgId, unConfiguredDatasourceList } = action.payload;
  yield put(getAllApplications());
  yield put(importApplicationSuccess(application));
  yield put(fetchPlugins({ orgId }));

  yield put(
    setUnconfiguredDatasourcesDuringImport(unConfiguredDatasourceList || []),
  );

  yield put(setOrgIdForImport(orgId));
  yield put(setIsReconnectingDatasourcesModalOpen({ isOpen: true }));
}

export function* importApplicationSaga(
  action: ReduxAction<ImportApplicationRequest>,
) {
  try {
    const response: ApiResponse = yield call(
      ApplicationApi.importApplicationToOrg,
      action.payload,
    );
    const isValidResponse: boolean = yield validateResponse(response);
    if (isValidResponse) {
      const allOrgs: Org[] = yield select(getCurrentOrg);
      const currentOrg = allOrgs.filter(
        (el: Org) => el.id === action.payload.orgId,
      );
      if (currentOrg.length > 0) {
        const {
          application: { applicationVersion, id, pages, slug: applicationSlug },
          isPartialImport,
        }: {
          application: {
            id: string;
            slug: string;
            applicationVersion: number;
            pages: {
              default?: boolean;
              id: string;
              isDefault?: boolean;
              slug: string;
            }[];
          };
          isPartialImport: boolean;
        } = response.data;

        yield put(importApplicationSuccess(response.data?.application));

        if (isPartialImport) {
          yield put(
            showReconnectDatasourceModal({
              application: response.data?.application,
              unConfiguredDatasourceList:
                response?.data.unConfiguredDatasourceList,
              orgId: action.payload.orgId,
            }),
          );
        } else {
          const defaultPage = pages.filter((eachPage) => !!eachPage.isDefault);
          const pageURL = builderURL({
            applicationSlug: applicationSlug ?? PLACEHOLDER_APP_SLUG,
            applicationId: id,
            applicationVersion:
              applicationVersion ?? ApplicationVersion.SLUG_URL,
            pageSlug: defaultPage[0].slug || PLACEHOLDER_PAGE_SLUG,
            pageId: defaultPage[0].id,
          });
          history.push(pageURL);
          const guidedTour: boolean = yield select(inGuidedTour);

          if (guidedTour) return;

          Toaster.show({
            text: "Application imported successfully",
            variant: Variant.success,
          });
        }
      }
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.IMPORT_APPLICATION_ERROR,
      payload: {
        error,
      },
    });
  }
}

export function* fetchApplicationPreviewWxaCodeSaga(
  action: ReduxAction<FetchApplicationPreviewPayload>,
) {
  try {
    const { applicationId } = action.payload;
    const response: ApiResponse = yield call(PageApi.getPreviewWxaCode, {
      app_id: applicationId,
    });
    yield put({
      type: ReduxActionTypes.FETCH_APPLICATION_PREVIEW_SUCCESS,
      payload: {
        data: response.data,
        failed: !response.responseMeta.success,
      },
    });
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.FETCH_APPLICATION_PREVIEW_ERROR,
      payload: {
        error,
      },
    });
  }
}

function* fetchReleases() {
  try {
    const response: FetchUsersApplicationsOrgsResponse = yield call(
      ApplicationApi.getAllApplication,
    );
    const isValidResponse = yield validateResponse(response);
    if (isValidResponse) {
      const { newReleasesCount, releaseItems } = response.data || {};
      yield put({
        type: ReduxActionTypes.FETCH_RELEASES_SUCCESS,
        payload: { newReleasesCount, releaseItems },
      });
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.FETCH_RELEASES_ERROR,
      payload: {
        error,
      },
    });
  }
}

export function* fetchUnconfiguredDatasourceList(
  action: ReduxAction<{
    applicationId: string;
    orgId: string;
  }>,
) {
  try {
    // Get endpoint based on app mode
    const response: FetchUnconfiguredDatasourceListResponse = yield call(
      ApplicationApi.fetchUnconfiguredDatasourceList,
      action.payload,
    );

    yield put(setUnconfiguredDatasourcesDuringImport(response.data || []));
  } catch (error) {
    yield put(setUnconfiguredDatasourcesDuringImport([]));
    yield put({
      type: ReduxActionErrorTypes.FETCH_APPLICATION_ERROR,
      payload: {
        error,
      },
    });
  }
}

export function* initializeDatasourceWithDefaultValues(datasource: Datasource) {
  if (!datasource.datasourceConfiguration) {
    yield call(checkAndGetPluginFormConfigsSaga, datasource.pluginId);
    const formConfig = yield select(getPluginForm, datasource.pluginId);
    const initialValues = yield call(getConfigInitialValues, formConfig);
    const payload = merge(initialValues, datasource);
    payload.isConfigured = false; // imported datasource as not configured yet
    const response = yield DatasourcesApi.updateDatasource(
      payload,
      datasource.id,
    );
    const isValidResponse: boolean = yield validateResponse(response);
    if (isValidResponse) {
      yield put({
        type: ReduxActionTypes.UPDATE_DATASOURCE_IMPORT_SUCCESS,
        payload: response.data,
      });
    }
  }
}

function* initDatasourceConnectionDuringImport(action: ReduxAction<string>) {
  const orgId = action.payload;

  const pluginsAndDatasourcesCalls: boolean = yield failFastApiCalls(
    [fetchPlugins({ orgId }), fetchDatasources({ orgId })],
    [
      ReduxActionTypes.FETCH_PLUGINS_SUCCESS,
      ReduxActionTypes.FETCH_DATASOURCES_SUCCESS,
    ],
    [
      ReduxActionErrorTypes.FETCH_PLUGINS_ERROR,
      ReduxActionErrorTypes.FETCH_DATASOURCES_ERROR,
    ],
  );
  if (!pluginsAndDatasourcesCalls) return;

  const pluginFormCall: boolean = yield failFastApiCalls(
    [fetchPluginFormConfigs()],
    [ReduxActionTypes.FETCH_PLUGIN_FORM_CONFIGS_SUCCESS],
    [ReduxActionErrorTypes.FETCH_PLUGIN_FORM_CONFIGS_ERROR],
  );
  if (!pluginFormCall) return;

  const datasources: Array<Datasource> = yield select((state: AppState) => {
    return state.entities.datasources.list;
  });

  yield all(
    datasources.map((datasource: Datasource) =>
      call(initializeDatasourceWithDefaultValues, datasource),
    ),
  );

  yield put(initDatasourceConnectionDuringImportSuccess());
}

export default function* applicationSagas() {
  yield all([
    takeLatest(
      ReduxActionTypes.PUBLISH_APPLICATION_INIT,
      publishApplicationSaga,
    ),
    takeLatest(ReduxActionTypes.UPDATE_APP_LAYOUT, updateApplicationLayoutSaga),
    takeLatest(ReduxActionTypes.UPDATE_APPLICATION, updateApplicationSaga),
    takeLatest(
      ReduxActionTypes.CHANGE_APPVIEW_ACCESS_INIT,
      changeAppViewAccessSaga,
    ),
    takeLatest(
      ReduxActionTypes.GET_ALL_APPLICATION_INIT,
      getAllApplicationSaga,
    ),
    takeLatest(ReduxActionTypes.FETCH_APPLICATION_INIT, fetchAppAndPagesSaga),
    takeLatest(ReduxActionTypes.FORK_APPLICATION_INIT, forkApplicationSaga),
    takeLatest(ReduxActionTypes.CREATE_APPLICATION_INIT, createApplicationSaga),
    takeLatest(
      ReduxActionTypes.SET_DEFAULT_APPLICATION_PAGE_INIT,
      setDefaultApplicationPageSaga,
    ),
    takeLatest(ReduxActionTypes.DELETE_APPLICATION_INIT, deleteApplicationSaga),
    takeLatest(
      ReduxActionTypes.DUPLICATE_APPLICATION_INIT,
      duplicateApplicationSaga,
    ),
    takeLatest(ReduxActionTypes.IMPORT_APPLICATION_INIT, importApplicationSaga),
    takeLatest(
      ReduxActionTypes.FETCH_APPLICATION_PREVIEW_INIT,
      fetchApplicationPreviewWxaCodeSaga,
    ),
    takeLatest(ReduxActionTypes.FETCH_RELEASES, fetchReleases),
    takeLatest(
      ReduxActionTypes.INIT_DATASOURCE_CONNECTION_DURING_IMPORT_REQUEST,
      initDatasourceConnectionDuringImport,
    ),
    takeLatest(
      ReduxActionTypes.SHOW_RECONNECT_DATASOURCE_MODAL,
      showReconnectDatasourcesModalSaga,
    ),
    takeLatest(
      ReduxActionTypes.FETCH_UNCONFIGURED_DATASOURCE_LIST,
      fetchUnconfiguredDatasourceList,
    ),
  ]);
}
