import React from "react";
import styled from "styled-components";
import { DATASOURCE_REST_API_FORM } from "@appsmith/constants/forms";
import type { Datasource } from "entities/Datasource";
import type { InjectedFormProps } from "redux-form";
import { getFormMeta, reduxForm } from "redux-form";
import AnalyticsUtil from "utils/AnalyticsUtil";
import FormControl from "pages/Editor/FormControl";
import { StyledInfo } from "components/formControls/InputTextControl";
import { connect } from "react-redux";
import type { AppState } from "@appsmith/reducers";
import { PluginType } from "entities/Action";
import { Button, Callout } from "design-system";
import {
  createDatasourceFromForm,
  redirectAuthorizationCode,
  toggleSaveActionFlag,
  updateDatasource,
} from "actions/datasourceActions";
import type { ReduxAction } from "@appsmith/constants/ReduxActionConstants";
import {
  datasourceToFormValues,
  formValuesToDatasource,
} from "transformers/RestAPIDatasourceFormTransformer";
import type {
  ApiDatasourceForm,
  AuthorizationCode,
  ClientCredentials,
} from "entities/Datasource/RestAPIForm";
import {
  ApiKeyAuthType,
  AuthType,
  GrantType,
  SSLType,
} from "entities/Datasource/RestAPIForm";
import { createMessage, INVALID_URL } from "@appsmith/constants/messages";
import Collapsible from "./Collapsible";
import _ from "lodash";
import FormLabel from "components/editorComponents/FormLabel";
import CopyToClipBoard from "components/designSystems/appsmith/CopyToClipBoard";
import { updateReplayEntity } from "actions/pageActions";
import { ENTITY_TYPE } from "entities/AppsmithConsole";
import { TEMP_DATASOURCE_ID } from "constants/Datasource";
import { hasManageDatasourcePermission } from "@appsmith/utils/permissionHelpers";
import { Form } from "./DBForm";

interface DatasourceRestApiEditorProps {
  initializeReplayEntity: (id: string, data: any) => void;
  updateDatasource: (
    formValues: Datasource,
    onSuccess?: ReduxAction<unknown>,
  ) => void;
  isSaving: boolean;
  applicationId: string;
  datasourceId: string;
  pageId: string;
  location: {
    search: string;
  };
  datasource: Datasource;
  formData: ApiDatasourceForm;
  formName: string;
  pluginName: string;
  pluginPackageName: string;
  formMeta: any;
  messages?: Array<string>;
  datasourceName: string;
  showFilterComponent: boolean;
  createDatasource: (
    data: Datasource,
    onSuccess?: ReduxAction<unknown>,
  ) => void;
  toggleSaveActionFlag: (flag: boolean) => void;
  triggerSave?: boolean;
  datasourceDeleteTrigger: () => void;
}

type Props = DatasourceRestApiEditorProps &
  InjectedFormProps<ApiDatasourceForm, DatasourceRestApiEditorProps>;

const FormInputContainer = styled.div`
  margin-top: 16px;
  .t--save-and-authorize-datasource {
    margin-left: 0;
  }
`;

class DatasourceRestAPIEditor extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  componentDidMount() {
    // set replay data
    this.props.initializeReplayEntity(
      this.props.datasource.id,
      this.props.initialValues,
    );
  }

  componentDidUpdate(prevProps: Props) {
    if (!this.props.formData) return;

    const { authType } = this.props.formData;

    if (authType === AuthType.OAuth2) {
      this.ensureOAuthDefaultsAreCorrect();
    } else if (authType === AuthType.apiKey) {
      this.ensureAPIKeyDefaultsAreCorrect();
    }

    // if trigger save changed, save datasource
    if (
      prevProps.triggerSave !== this.props.triggerSave &&
      this.props.triggerSave
    ) {
      this.save();
    }
  }

  isDirty(prop: any) {
    const { formMeta } = this.props;
    return _.get(formMeta, prop + ".visited", false);
  }

  ensureAPIKeyDefaultsAreCorrect = () => {
    if (!this.props.formData) return;
    const { authentication } = this.props.formData;
    if (!authentication || !_.get(authentication, "addTo")) {
      this.props.change("authentication.addTo", ApiKeyAuthType.Header);
    }
    if (!authentication || !_.get(authentication, "headerPrefix")) {
      this.props.change("authentication.headerPefix", "ApiKeyAuthType.Header");
    }
  };

  ensureOAuthDefaultsAreCorrect = () => {
    if (!this.props.formData) return;
    const { authentication } = this.props.formData;

    if (!authentication || !_.get(authentication, "grantType")) {
      this.props.change(
        "authentication.grantType",
        GrantType.ClientCredentials,
      );
    }
    if (_.get(authentication, "isTokenHeader") === undefined) {
      this.props.change("authentication.isTokenHeader", true);
    }
    if (
      !this.isDirty("authentication.headerPrefix") &&
      _.get(authentication, "headerPrefix") === undefined
    ) {
      this.props.change("authentication.headerPrefix", "Bearer");
    }

    if (_.get(authentication, "grantType") === GrantType.AuthorizationCode) {
      if (_.get(authentication, "isAuthorizationHeader") === undefined) {
        this.props.change("authentication.isAuthorizationHeader", true);
      }
    }

    if (_.get(authentication, "grantType") === GrantType.ClientCredentials) {
      if (_.get(authentication, "isAuthorizationHeader") === undefined) {
        this.props.change("authentication.isAuthorizationHeader", false);
      }
    }

    if (_.get(authentication, "grantType") === GrantType.AuthorizationCode) {
      if (
        _.get(authentication, "sendScopeWithRefreshToken") === undefined ||
        _.get(authentication, "sendScopeWithRefreshToken") === ""
      ) {
        this.props.change("authentication.sendScopeWithRefreshToken", false);
      }
    }

    if (_.get(authentication, "grantType") === GrantType.AuthorizationCode) {
      if (
        _.get(authentication, "refreshTokenClientCredentialsLocation") ===
          undefined ||
        _.get(authentication, "refreshTokenClientCredentialsLocation") === ""
      ) {
        this.props.change(
          "authentication.refreshTokenClientCredentialsLocation",
          "BODY",
        );
      }
    }
  };

  validate = (): boolean => {
    const { datasource, datasourceId, formData } = this.props;
    const createMode = datasourceId === TEMP_DATASOURCE_ID;
    const canManageDatasource = hasManageDatasourcePermission(
      datasource?.userPermissions || [],
    );
    if (!formData) return true;
    return !formData.url || (!createMode && !canManageDatasource);
  };

  getSanitizedFormData = () =>
    formValuesToDatasource(this.props.datasource, this.props.formData);

  save = (onSuccess?: ReduxAction<unknown>) => {
    this.props.toggleSaveActionFlag(true);
    const normalizedValues = this.getSanitizedFormData();

    AnalyticsUtil.logEvent("SAVE_DATA_SOURCE_CLICK", {
      pageId: this.props.pageId,
      appId: this.props.applicationId,
      pluginName: this.props.pluginName || "",
      pluginPackageName: this.props.pluginPackageName || "",
    });

    if (this.props.datasource.id !== TEMP_DATASOURCE_ID) {
      return this.props.updateDatasource(normalizedValues, onSuccess);
    }

    this.props.createDatasource(
      {
        ...normalizedValues,
        name: this.props.datasourceName,
      },
      onSuccess,
    );
  };

  urlValidator = (value: string) => {
    const validationRegex = "^(http|https)://";
    if (value) {
      const regex = new RegExp(validationRegex);

      return regex.test(value)
        ? { isValid: true, message: "" }
        : {
            isValid: false,
            message: createMessage(INVALID_URL),
          };
    }

    return { isValid: true, message: "" };
  };

  render = () => {
    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        showFilterComponent={this.props.showFilterComponent}
      >
        {this.renderEditor()}
      </Form>
    );
  };

  renderEditor = () => {
    const { datasource, datasourceId, formData, isSaving, messages, pageId } =
      this.props;
    const isAuthorized = _.get(
      datasource,
      "datasourceConfiguration.authentication.isAuthorized",
      false,
    );
    if (!formData) return;

    const { authentication } = formData;

    return (
      <>
        {messages &&
          messages.map((msg, i) => (
            <Callout key={i} kind="warning">
              {msg}
            </Callout>
          ))}
        {this.renderGeneralSettings()}
        {this.renderAuthFields()}
        {this.renderOauth2AdvancedSettings()}
        {this.renderSelfSignedCertificateFields()}
        {formData.authType &&
          formData.authType === AuthType.OAuth2 &&
          _.get(authentication, "grantType") ===
            GrantType.AuthorizationCode && (
            <FormInputContainer>
              <Button
                className="t--save-and-authorize-datasource"
                isDisabled={this.validate()}
                isLoading={isSaving}
                onClick={() =>
                  this.save(
                    redirectAuthorizationCode(
                      pageId,
                      datasourceId,
                      PluginType.API,
                    ),
                  )
                }
              >
                {isAuthorized ? "Save and Re-Authorize" : "Save and Authorize"}
              </Button>
            </FormInputContainer>
          )}
      </>
    );
  };

  renderGeneralSettings = () => {
    const { formData } = this.props;

    return (
      <section
        className="t--section-general"
        data-replay-id="section-General"
        data-testid="section-General"
      >
        <FormInputContainer data-replay-id={btoa("url")}>
          {this.renderInputTextControlViaFormControl({
            configProperty: "url",
            label: "URL",
            placeholderText: "https://example.com",
            dataType: "TEXT",
            encrypted: false,
            isRequired: true,
            fieldValidator: this.urlValidator,
          })}
        </FormInputContainer>
        <FormInputContainer
          className="t--headers-array"
          data-replay-id={btoa("headers")}
        >
          {this.renderKeyValueControlViaFormControl(
            "headers",
            "请求头",
            "",
            false,
          )}
        </FormInputContainer>
        <FormInputContainer data-replay-id={btoa("queryParameters")}>
          {this.renderKeyValueControlViaFormControl(
            "queryParameters",
            "查询参数",
            "",
            false,
          )}
        </FormInputContainer>
        <FormInputContainer data-replay-id={btoa("isSendSessionEnabled")}>
          {this.renderDropdownControlViaFormControl(
            "isSendSessionEnabled",
            [
              {
                label: "是",
                value: true,
              },
              {
                label: "否",
                value: false,
              },
            ],
            "发送带有签名的请求头",
            "",
            true,
            "Header key: X-APPSMITH-SIGNATURE",
          )}
        </FormInputContainer>
        {formData.isSendSessionEnabled && (
          <FormInputContainer data-replay-id={btoa("sessionSignatureKey")}>
            {this.renderInputTextControlViaFormControl({
              configProperty: "sessionSignatureKey",
              label: "会话详情签名Key",
              placeholderText: "",
              dataType: "TEXT",
              encrypted: false,
              isRequired: false,
            })}
          </FormInputContainer>
        )}
        <FormInputContainer data-replay-id={btoa("authType")}>
          {this.renderDropdownControlViaFormControl(
            "authType",
            [
              {
                label: "无",
                value: AuthType.NONE,
              },
              {
                label: "Basic",
                value: AuthType.basic,
              },
              {
                label: "OAuth 2.0",
                value: AuthType.OAuth2,
              },
              {
                label: "API key",
                value: AuthType.apiKey,
              },
              {
                label: "Bearer token",
                value: AuthType.bearerToken,
              },
            ],
            "认证类型",
            "",
            false,
            "",
          )}
        </FormInputContainer>
      </section>
    );
  };

  renderSelfSignedCertificateFields = () => {
    const { connection } = this.props.formData;
    if (connection?.ssl.authType === SSLType.SELF_SIGNED_CERTIFICATE) {
      return (
        <Collapsible defaultIsOpen title="证书详情">
          {this.renderFilePickerControlViaFormControl(
            "connection.ssl.certificateFile",
            "上传证书",
            "",
            false,
            true,
          )}
        </Collapsible>
      );
    }
  };

  renderAuthFields = () => {
    const { authType } = this.props.formData;

    let content;
    if (authType === AuthType.OAuth2) {
      content = this.renderOauth2();
    } else if (authType === AuthType.basic) {
      content = this.renderBasic();
    } else if (authType === AuthType.apiKey) {
      content = this.renderApiKey();
    } else if (authType === AuthType.bearerToken) {
      content = this.renderBearerToken();
    }
    if (content) {
      return (
        <Collapsible defaultIsOpen title="Authentication">
          {content}
        </Collapsible>
      );
    }
  };

  renderApiKey = () => {
    const { authentication } = this.props.formData;
    return (
      <>
        <FormInputContainer data-replay-id={btoa("authentication.label")}>
          {this.renderInputTextControlViaFormControl({
            configProperty: "authentication.label",
            label: "Key",
            placeholderText: "api_key",
            dataType: "TEXT",
            encrypted: false,
            isRequired: false,
          })}
        </FormInputContainer>
        <FormInputContainer>
          {this.renderInputTextControlViaFormControl({
            configProperty: "authentication.value",
            label: "Value",
            placeholderText: "value",
            dataType: "TEXT",
            encrypted: true,
            isRequired: false,
          })}
        </FormInputContainer>
        <FormInputContainer>
          {this.renderDropdownControlViaFormControl(
            "authentication.addTo",
            [
              {
                label: "查询参数",
                value: ApiKeyAuthType.QueryParams,
              },
              {
                label: "请求头",
                value: ApiKeyAuthType.Header,
              },
            ],
            "添加到",
            "",
            false,
            "",
          )}
        </FormInputContainer>
        {_.get(authentication, "addTo") == "header" && (
          <FormInputContainer
            data-replay-id={btoa("authentication.headerPrefix")}
          >
            {this.renderInputTextControlViaFormControl({
              configProperty: "authentication.headerPrefix",
              label: "请求头前缀",
              placeholderText: "例如：Bearer ",
              dataType: "TEXT",
              encrypted: false,
              isRequired: false,
            })}
          </FormInputContainer>
        )}
      </>
    );
  };

  renderBearerToken = () => {
    return (
      <FormInputContainer data-replay-id={btoa("authentication.bearerToken")}>
        {this.renderInputTextControlViaFormControl({
          configProperty: "authentication.bearerToken",
          label: "Bearer token",
          placeholderText: "Bearer token",
          dataType: "TEXT",
          encrypted: true,
          isRequired: false,
        })}
      </FormInputContainer>
    );
  };

  renderBasic = () => {
    return (
      <>
        <FormInputContainer data-replay-id={btoa("authentication.username")}>
          {this.renderInputTextControlViaFormControl({
            configProperty: "authentication.username",
            label: "用户名",
            placeholderText: "用户名",
            dataType: "TEXT",
            encrypted: false,
            isRequired: false,
          })}
        </FormInputContainer>
        <FormInputContainer data-replay-id={btoa("authentication.password")}>
          {this.renderInputTextControlViaFormControl({
            configProperty: "authentication.password",
            label: "密码",
            placeholderText: "密码",
            dataType: "PASSWORD",
            encrypted: true,
            isRequired: false,
            isSecretExistsPath: "authentication.secretExists.password",
          })}
        </FormInputContainer>
      </>
    );
  };

  renderOauth2 = () => {
    const authentication = this.props.formData.authentication as
      | ClientCredentials
      | AuthorizationCode
      | undefined;
    if (!authentication) return;
    let content;
    switch (authentication.grantType) {
      case GrantType.AuthorizationCode:
        content = this.renderOauth2AuthorizationCode();
        break;
      case GrantType.ClientCredentials:
        content = this.renderOauth2ClientCredentials();
        break;
    }

    return (
      <>
        <FormInputContainer data-replay-id={btoa("authentication.grantType")}>
          {this.renderDropdownControlViaFormControl(
            "authentication.grantType",
            [
              {
                label: "客户端鉴权",
                value: GrantType.ClientCredentials,
              },
              {
                label: "鉴权码",
                value: GrantType.AuthorizationCode,
              },
            ],
            "授权类型",
            "",
            false,
            "",
          )}
        </FormInputContainer>
        {content}
      </>
    );
  };

  renderOauth2Common = () => {
    const { formData } = this.props;
    return (
      <>
        <FormInputContainer
          data-replay-id={btoa("authentication.isTokenHeader")}
        >
          {this.renderDropdownControlViaFormControl(
            "authentication.isTokenHeader",
            [
              {
                label: "请求头",
                value: true,
              },
              {
                label: "请求URL",
                value: false,
              },
            ],
            "添加 Access Token 到",
            "",
            false,
            "",
          )}
        </FormInputContainer>
        {_.get(formData.authentication, "isTokenHeader") && (
          <FormInputContainer
            data-replay-id={btoa("authentication.headerPrefix")}
          >
            {this.renderInputTextControlViaFormControl({
              configProperty: "authentication.headerPrefix",
              label: "请求头前缀",
              placeholderText: "例如：Bearer ",
              dataType: "TEXT",
              encrypted: false,
              isRequired: false,
            })}
          </FormInputContainer>
        )}
        <FormInputContainer
          data-replay-id={btoa("authentication.accessTokenUrl")}
        >
          {this.renderInputTextControlViaFormControl({
            configProperty: "authentication.accessTokenUrl",
            label: "Access token URL",
            placeholderText: "https://example.com/login/oauth/access_token",
            dataType: "TEXT",
            encrypted: false,
            isRequired: false,
            fieldValidator: this.urlValidator,
          })}
        </FormInputContainer>
        <FormInputContainer data-replay-id={btoa("authentication.clientId")}>
          {this.renderInputTextControlViaFormControl({
            configProperty: "authentication.clientId",
            label: "Client ID",
            placeholderText: "Client ID",
            dataType: "TEXT",
            encrypted: false,
            isRequired: false,
          })}
        </FormInputContainer>
        <FormInputContainer
          data-replay-id={btoa("authentication.clientSecret")}
        >
          {this.renderInputTextControlViaFormControl({
            configProperty: "authentication.clientSecret",
            label: "Client secret",
            placeholderText: "Client secret",
            dataType: "PASSWORD",
            encrypted: true,
            isRequired: false,
            isSecretExistsPath: "authentication.secretExists.clientSecret",
          })}
        </FormInputContainer>
        <FormInputContainer data-replay-id={btoa("authentication.scopeString")}>
          {this.renderInputTextControlViaFormControl({
            configProperty: "authentication.scopeString",
            label: "Scope(s)",
            placeholderText: "e.g. read, write",
            dataType: "TEXT",
            encrypted: false,
            isRequired: false,
          })}
        </FormInputContainer>
        <FormInputContainer
          data-replay-id={btoa("authentication.isAuthorizationHeader")}
        >
          {this.renderDropdownControlViaFormControl(
            "authentication.isAuthorizationHeader",
            [
              {
                label: "Send as Basic Auth header",
                value: true,
              },
              {
                label: "Send client credentials in body",
                value: false,
              },
            ],
            "Client Authentication",
            "",
            false,
            "",
          )}
        </FormInputContainer>
      </>
    );
  };

  renderOauth2AdvancedSettings = () => {
    const { authentication, authType, connection } = this.props.formData;
    const isGrantTypeAuthorizationCode =
      _.get(authentication, "grantType") === GrantType.AuthorizationCode;
    const isAuthenticationTypeOAuth2 = authType === AuthType.OAuth2;
    const isConnectSelfSigned =
      _.get(connection, "ssl.authType") === SSLType.SELF_SIGNED_CERTIFICATE;

    return (
      <Collapsible title="高级配置">
        {isAuthenticationTypeOAuth2 && isGrantTypeAuthorizationCode && (
          <FormInputContainer
            data-replay-id={btoa("authentication.sendScopeWithRefreshToken")}
          >
            {this.renderDropdownControlViaFormControl(
              "authentication.sendScopeWithRefreshToken",
              [
                {
                  label: "是",
                  value: true,
                },
                {
                  label: "否",
                  value: false,
                },
              ],
              "Send scope with refresh token",
              "",
              false,
              "",
            )}
          </FormInputContainer>
        )}
        {isAuthenticationTypeOAuth2 && isGrantTypeAuthorizationCode && (
          <FormInputContainer
            data-replay-id={btoa(
              "authentication.refreshTokenClientCredentialsLocation",
            )}
          >
            {this.renderDropdownControlViaFormControl(
              "authentication.refreshTokenClientCredentialsLocation",
              [
                {
                  label: "Body",
                  value: "BODY",
                },
                {
                  label: "Header",
                  value: "HEADER",
                },
              ],
              "Send client credentials with (on refresh token):",
              "",
              false,
              "",
            )}
          </FormInputContainer>
        )}
        <FormInputContainer data-replay-id={btoa("ssl")}>
          {this.renderDropdownControlViaFormControl(
            "connection.ssl.authType",
            [
              {
                label: "不",
                value: "DEFAULT",
              },
              {
                label: "是",
                value: "SELF_SIGNED_CERTIFICATE",
              },
            ],
            "使用自签名证书",
            "",
            true,
            "",
            "DEFAULT",
          )}
        </FormInputContainer>
        {isAuthenticationTypeOAuth2 && isConnectSelfSigned && (
          <FormInputContainer data-replay-id={btoa("selfsignedcert")}>
            {this.renderCheckboxViaFormControl(
              "authentication.useSelfSignedCert",
              "使用自签名证书来给请求鉴权",
              "",
              false,
            )}
          </FormInputContainer>
        )}
      </Collapsible>
    );
  };

  renderOauth2CommonAdvanced = () => {
    return (
      <>
        <FormInputContainer data-replay-id={btoa("authentication.audience")}>
          {this.renderInputTextControlViaFormControl({
            configProperty: "authentication.audience",
            label: "Audience",
            placeholderText: "https://example.com/oauth/audience",
            dataType: "TEXT",
            encrypted: false,
            isRequired: false,
          })}
        </FormInputContainer>
        <FormInputContainer data-replay-id={btoa("authentication.resource")}>
          {this.renderInputTextControlViaFormControl({
            configProperty: "authentication.resource",
            label: "Resource",
            placeholderText: "https://example.com/oauth/resource",
            dataType: "TEXT",
            encrypted: false,
            isRequired: false,
          })}
        </FormInputContainer>
      </>
    );
  };

  renderOauth2ClientCredentials = () => {
    return (
      <>
        {this.renderOauth2Common()}
        {this.renderOauth2CommonAdvanced()}
      </>
    );
  };

  renderOauth2AuthorizationCode = () => {
    const { formData } = this.props;

    const redirectURL =
      window.location.origin + "/api/v1/datasources/authorize";
    return (
      <>
        {this.renderOauth2Common()}
        <FormInputContainer
          data-replay-id={btoa("authentication.authorizationUrl")}
        >
          {this.renderInputTextControlViaFormControl({
            configProperty: "authentication.authorizationUrl",
            label: "Authorization URL",
            placeholderText: "https://example.com/login/oauth/authorize",
            dataType: "TEXT",
            encrypted: false,
            isRequired: false,
          })}
        </FormInputContainer>
        <FormInputContainer>
          <div style={{ width: "20vw" }}>
            <FormLabel>
              重定向 URL
              <br />
              <StyledInfo>oauth 服务器重定向Url</StyledInfo>
            </FormLabel>
            <CopyToClipBoard copyText={redirectURL} />
          </div>
        </FormInputContainer>
        <FormInputContainer
          data-replay-id={btoa("authentication.customAuthenticationParameters")}
        >
          {this.renderKeyValueControlViaFormControl(
            "authentication.customAuthenticationParameters",
            "自定义鉴权参数",
            "",
            false,
          )}
        </FormInputContainer>

        {!_.get(formData.authentication, "isAuthorizationHeader", true) &&
          this.renderOauth2CommonAdvanced()}
      </>
    );
  };

  // All components in formControls must be rendered via FormControl.
  // FormControl is the common wrapper for all formcontrol components and contains common elements i.e. label, subtitle, helpertext
  renderInputTextControlViaFormControl({
    configProperty,
    dataType,
    encrypted,
    fieldValidator,
    isRequired,
    isSecretExistsPath,
    label,
    placeholderText,
  }: {
    configProperty: string;
    label: string;
    placeholderText: string;
    dataType: "TEXT" | "PASSWORD" | "NUMBER";
    encrypted: boolean;
    isRequired: boolean;
    fieldValidator?: (value: string) => { isValid: boolean; message: string };
    isSecretExistsPath?: string;
  }) {
    return (
      <FormControl
        config={{
          id: "",
          isValid: false,
          isRequired: isRequired,
          controlType: "INPUT_TEXT",
          dataType: dataType,
          configProperty: configProperty,
          encrypted: encrypted,
          label: label,
          conditionals: {},
          placeholderText: placeholderText,
          formName: this.props.formName,
          validator: fieldValidator,
          isSecretExistsPath,
        }}
        formName={this.props.formName}
        multipleConfig={[]}
      />
    );
  }

  renderDropdownControlViaFormControl(
    configProperty: string,
    options: {
      label: string;
      value: string | boolean;
    }[],
    label: string,
    placeholderText: string,
    isRequired: boolean,
    subtitle?: string,
    initialValue?: any,
  ) {
    const config = {
      id: "",
      isValid: false,
      isRequired: isRequired,
      controlType: "DROP_DOWN",
      configProperty: configProperty,
      options: options,
      subtitle: subtitle,
      label: label,
      conditionals: {},
      placeholderText: placeholderText,
      formName: this.props.formName,
      initialValue: initialValue,
    };
    return (
      <FormControl
        config={config}
        formName={this.props.formName}
        multipleConfig={[]}
      />
    );
  }

  renderKeyValueControlViaFormControl(
    configProperty: string,
    label: string,
    placeholderText: string,
    isRequired: boolean,
  ) {
    const config = {
      id: "",
      configProperty: configProperty,
      isValid: false,
      controlType: "KEYVALUE_ARRAY",
      placeholderText: placeholderText,
      label: label,
      conditionals: {},
      formName: this.props.formName,
      isRequired: isRequired,
    };
    return (
      <FormControl
        config={config}
        formName={this.props.formName}
        multipleConfig={[]}
      />
    );
  }

  renderFilePickerControlViaFormControl(
    configProperty: string,
    label: string,
    placeholderText: string,
    isRequired: boolean,
    encrypted: boolean,
  ) {
    const config = {
      id: "",
      configProperty: configProperty,
      isValid: false,
      controlType: "FILE_PICKER",
      placeholderText: placeholderText,
      encrypted: encrypted,
      label: label,
      conditionals: {},
      formName: this.props.formName,
      isRequired: isRequired,
    };
    return (
      <FormControl
        config={config}
        formName={this.props.formName}
        multipleConfig={[]}
      />
    );
  }

  renderCheckboxViaFormControl(
    configProperty: string,
    label: string,
    placeholderText: string,
    isRequired: boolean,
  ) {
    return (
      <FormControl
        config={{
          id: "",
          isValid: false,
          isRequired: isRequired,
          controlType: "CHECKBOX",
          configProperty: configProperty,
          label: label,
          conditionals: {},
          placeholderText: placeholderText,
          formName: this.props.formName,
        }}
        formName={this.props.formName}
      />
    );
  }
}

const mapStateToProps = (state: AppState, props: any) => {
  const { datasource, formName } = props;
  const hintMessages = datasource && datasource.messages;

  return {
    initialValues: datasourceToFormValues(datasource),
    formMeta: getFormMeta(formName)(state),
    messages: hintMessages,
    datasourceName: datasource?.name ?? "",
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    initializeReplayEntity: (id: string, data: any) =>
      dispatch(updateReplayEntity(id, data, ENTITY_TYPE.DATASOURCE)),
    updateDatasource: (formData: any, onSuccess?: ReduxAction<unknown>) =>
      dispatch(updateDatasource(formData, onSuccess)),
    createDatasource: (formData: any, onSuccess?: ReduxAction<unknown>) =>
      dispatch(createDatasourceFromForm(formData, onSuccess)),
    toggleSaveActionFlag: (flag: boolean) =>
      dispatch(toggleSaveActionFlag(flag)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(
  reduxForm<ApiDatasourceForm, DatasourceRestApiEditorProps>({
    form: DATASOURCE_REST_API_FORM,
    enableReinitialize: true,
  })(DatasourceRestAPIEditor),
);
