import React, { useMemo } from "react";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import { getIsFetchingPage } from "selectors/appViewSelectors";
import styled from "styled-components";
import { AppViewerRouteParams } from "constants/routes";
import { theme } from "constants/DefaultTheme";
import { Icon, NonIdealState, Spinner } from "@blueprintjs/core";
import Centered from "components/designSystems/appsmith/CenteredWrapper";
import AppPage from "./AppPage";
import {
  getCanvasWidgetDsl,
  getCurrentPageName,
  selectURLSlugs,
} from "selectors/editorSelectors";
import RequestConfirmationModal from "pages/Editor/RequestConfirmationModal";
import { getCurrentApplication } from "selectors/applicationSelectors";
import {
  isPermitted,
  PERMISSION_TYPE,
} from "../Applications/permissionHelpers";
import { builderURL } from "RouteBuilder";

const Section = styled.section<{
  height: number;
}>`
  background: #fff;
  height: 100%;
  min-height: ${({ height }) => height}px;
  margin: 0 auto;
  position: relative;
  overflow-x: auto;
  overflow-y: auto;
`;

const SafeFixedArea = styled.div<{
  height: number;
}>`
  margin-bottom: ${(props) => props.height}px;
`;

type AppViewerPageContainerProps = RouteComponentProps<AppViewerRouteParams>;

function AppViewerPageContainer(props: AppViewerPageContainerProps) {
  const currentPageName = useSelector(getCurrentPageName);
  const widgets = useSelector(getCanvasWidgetDsl);
  const isFetchingPage = useSelector(getIsFetchingPage);
  const currentApplication = useSelector(getCurrentApplication);
  const { match } = props;
  const { applicationSlug, pageSlug } = useSelector(selectURLSlugs);
  const hasFixedWidget = widgets.children?.find(
    (w) => w.type === "TARO_BOTTOM_BAR_WIDGET",
  );

  // get appsmith editr link
  const appsmithEditorLink = useMemo(() => {
    if (
      currentApplication?.userPermissions &&
      isPermitted(
        currentApplication?.userPermissions,
        PERMISSION_TYPE.MANAGE_APPLICATION,
      )
    ) {
      return (
        <p>
          想给页面添加组件？立即前往&nbsp;
          <Link
            to={builderURL({
              applicationSlug: applicationSlug,
              pageSlug: pageSlug,
              pageId: props.match.params.pageId as string,
            })}
          >
            页面编辑
          </Link>
        </p>
      );
    }
  }, [currentApplication?.userPermissions]);

  const pageNotFound = (
    <Centered>
      <NonIdealState
        description={appsmithEditorLink}
        icon={
          <Icon
            color={theme.colors.primaryOld}
            icon="page-layout"
            iconSize={theme.fontSizes[9]}
          />
        }
        title="页面空空如也😅"
      />
    </Centered>
  );

  const pageLoading = (
    <Centered>
      <Spinner />
    </Centered>
  );

  if (isFetchingPage) return pageLoading;

  if (!(widgets.children && widgets.children.length > 0)) return pageNotFound;

  return (
    <Section height={widgets.bottomRow}>
      <AppPage
        appName={currentApplication?.name}
        dsl={widgets}
        pageId={match.params.pageId}
        pageName={currentPageName}
      />
      <RequestConfirmationModal />
      {hasFixedWidget ? (
        <SafeFixedArea height={hasFixedWidget?.height || 0} />
      ) : null}
    </Section>
  );
}

export default withRouter(AppViewerPageContainer);
