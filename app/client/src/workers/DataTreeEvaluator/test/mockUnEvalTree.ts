import { PluginType, PaginationType } from "entities/Action";
import {
  DataTree,
  EvaluationSubstitutionType,
  DataTreeWidget,
  DataTreeAppsmith,
  ENTITY_TYPE,
} from "entities/DataTree/dataTreeFactory";

export const unEvalTree = {
  MainContainer: {
    widgetName: "MainContainer",
    backgroundColor: "none",
    rightColumn: 2220,
    snapColumns: 64,
    detachFromLayout: true,
    widgetId: "0",
    topRow: 0,
    bottomRow: 640,
    containerStyle: "none",
    snapRows: 113,
    parentRowSpace: 1,
    type: "CANVAS_WIDGET",
    canExtend: true,
    version: 52,
    minHeight: 620,
    parentColumnSpace: 1,
    dynamicBindingPathList: [],
    leftColumn: 0,
    children: ["j9dpft2lpu", "l0yem4eh6l"],
    defaultProps: {},
    defaultMetaProps: [],
    logBlackList: {},
    meta: {},
    propertyOverrideDependency: {},
    overridingPropertyPaths: {},
    reactivePaths: {},
    triggerPaths: {},
    validationPaths: {},
    ENTITY_TYPE: "WIDGET",
    privateWidgets: {},
  },
  Button1: {
    widgetName: "Button1",
    buttonColor: "#03B365",
    displayName: "Button",
    iconSVG: "/static/media/icon.cca02633.svg",
    topRow: 15,
    bottomRow: 19,
    parentRowSpace: 10,
    type: "BUTTON_WIDGET",
    hideCard: false,
    animateLoading: true,
    parentColumnSpace: 26.421875,
    dynamicTriggerPathList: [],
    leftColumn: 20,
    dynamicBindingPathList: [],
    text: "button1",
    isDisabled: false,
    key: "r6h8y6dc8i",
    rightColumn: 36,
    isDefaultClickDisabled: true,
    widgetId: "j9dpft2lpu",
    isVisible: true,
    recaptchaType: "V3",
    version: 1,
    parentId: "0",
    renderMode: "CANVAS",
    isLoading: false,
    buttonVariant: "PRIMARY",
    placement: "CENTER",
    defaultProps: {},
    defaultMetaProps: ["recaptchaToken"],
    logBlackList: {},
    meta: {},
    propertyOverrideDependency: {},
    overridingPropertyPaths: {},
    reactivePaths: {
      recaptchaToken: "TEMPLATE",
      text: "TEMPLATE",
      tooltip: "TEMPLATE",
      googleRecaptchaKey: "TEMPLATE",
      recaptchaType: "TEMPLATE",
      isVisible: "TEMPLATE",
      isDisabled: "TEMPLATE",
      animateLoading: "TEMPLATE",
      buttonVariant: "TEMPLATE",
      placement: "TEMPLATE",
    },
    triggerPaths: {
      onClick: true,
    },
    validationPaths: {
      text: {
        type: "TEXT",
      },
      tooltip: {
        type: "TEXT",
      },
      googleRecaptchaKey: {
        type: "TEXT",
      },
      recaptchaType: {
        type: "TEXT",
        params: {
          allowedValues: ["V3", "V2"],
          default: "V3",
        },
      },
      isVisible: {
        type: "BOOLEAN",
      },
      isDisabled: {
        type: "BOOLEAN",
      },
      animateLoading: {
        type: "BOOLEAN",
      },
      buttonVariant: {
        type: "TEXT",
        params: {
          allowedValues: ["PRIMARY", "SECONDARY", "TERTIARY"],
          default: "PRIMARY",
        },
      },
      placement: {
        type: "TEXT",
        params: {
          allowedValues: ["START", "BETWEEN", "CENTER"],
          default: "CENTER",
        },
      },
    },
    ENTITY_TYPE: "WIDGET",
    privateWidgets: {},
  },
  Button2: {
    widgetName: "Button2",
    buttonColor: "#03B365",
    displayName: "Button",
    iconSVG: "/static/media/icon.cca02633.svg",
    topRow: 25,
    bottomRow: 29,
    parentRowSpace: 10,
    type: "BUTTON_WIDGET",
    hideCard: false,
    animateLoading: true,
    parentColumnSpace: 26.421875,
    dynamicTriggerPathList: [],
    leftColumn: 20,
    dynamicBindingPathList: [
      {
        key: "text",
      },
    ],
    text: "{{Button1.text}}",
    isDisabled: false,
    key: "r6h8y6dc8i",
    rightColumn: 36,
    isDefaultClickDisabled: true,
    widgetId: "l0yem4eh6l",
    isVisible: true,
    recaptchaType: "V3",
    version: 1,
    parentId: "0",
    renderMode: "CANVAS",
    isLoading: false,
    buttonVariant: "PRIMARY",
    placement: "CENTER",
    defaultProps: {},
    defaultMetaProps: ["recaptchaToken"],
    logBlackList: {},
    meta: {},
    propertyOverrideDependency: {},
    overridingPropertyPaths: {},
    reactivePaths: {
      recaptchaToken: "TEMPLATE",
      text: "TEMPLATE",
      tooltip: "TEMPLATE",
      googleRecaptchaKey: "TEMPLATE",
      recaptchaType: "TEMPLATE",
      isVisible: "TEMPLATE",
      isDisabled: "TEMPLATE",
      animateLoading: "TEMPLATE",
      buttonVariant: "TEMPLATE",
      placement: "TEMPLATE",
    },
    triggerPaths: {
      onClick: true,
    },
    validationPaths: {
      text: {
        type: "TEXT",
      },
      tooltip: {
        type: "TEXT",
      },
      googleRecaptchaKey: {
        type: "TEXT",
      },
      recaptchaType: {
        type: "TEXT",
        params: {
          allowedValues: ["V3", "V2"],
          default: "V3",
        },
      },
      isVisible: {
        type: "BOOLEAN",
      },
      isDisabled: {
        type: "BOOLEAN",
      },
      animateLoading: {
        type: "BOOLEAN",
      },
      buttonVariant: {
        type: "TEXT",
        params: {
          allowedValues: ["PRIMARY", "SECONDARY", "TERTIARY"],
          default: "PRIMARY",
        },
      },
      placement: {
        type: "TEXT",
        params: {
          allowedValues: ["START", "BETWEEN", "CENTER"],
          default: "CENTER",
        },
      },
    },
    ENTITY_TYPE: "WIDGET",
    privateWidgets: {},
  },
  pageList: [
    {
      pageName: "Page1",
      pageId: "6200d1a2b5bfc0392b959cae",
      isDefault: true,
      isHidden: false,
    },
    {
      pageName: "Page2",
      pageId: "621e22cf2b75295c1c165fa6",
      isDefault: false,
      isHidden: false,
    },
    {
      pageName: "Page3",
      pageId: "6220c268c48234070f8ac65a",
      isDefault: false,
      isHidden: false,
    },
  ],
  appsmith: {
    user: {
      email: "rathod@appsmith.com",
      organizationIds: [
        "6218a61972ccd9145ec78c57",
        "621913df0276eb01d22fec44",
        "60caf8edb1e47a1315f0c48f",
        "609114fe05c4d35a9f6cbbf2",
      ],
      username: "rathod@appsmith.com",
      name: "Rishabh",
      commentOnboardingState: "RESOLVED",
      role: "engineer",
      useCase: "personal project",
      enableTelemetry: false,
      emptyInstance: false,
      accountNonExpired: true,
      accountNonLocked: true,
      credentialsNonExpired: true,
      isAnonymous: false,
      isEnabled: true,
      isSuperUser: false,
      isConfigurable: true,
    },
    URL: {
      fullPath:
        "https://dev.appsmith.com/applications/6200d1a2b5bfc0392b959cab/pages/6220c268c48234070f8ac65a/edit?a=b",
      host: "dev.appsmith.com",
      hostname: "dev.appsmith.com",
      queryParams: {
        a: "b",
      },
      protocol: "https:",
      pathname:
        "/applications/6200d1a2b5bfc0392b959cab/pages/6220c268c48234070f8ac65a/edit",
      port: "",
      hash: "",
    },
    store: {
      textColor: "#DF7E65",
    },
    geolocation: {
      canBeRequested: true,
    },
    mode: "EDIT",
    ENTITY_TYPE: "APPSMITH",
  },
};

export const asyncTagUnevalTree: DataTree = {
  Api1: {
    run: {},
    clear: {},
    actionId: "6279ff0c0b47255c280c4631",
    name: "Api1",
    pluginId: "5ca385dc81b37f0004b4db85",
    pluginType: PluginType.API,
    config: {
      timeoutInMillisecond: 10000,
      paginationType: PaginationType.NONE,
      path: "/echo/get",
      queryParameters: [],
      pluginSpecifiedTemplates: [
        {
          value: true,
        },
      ],
      formData: {
        apiContentType: "none",
      },
    },
    dynamicBindingPathList: [],
    data: {
      args: {},
      url: "https://mock-api.appsmith.com/echo/get",
      headers: {
        accept: "*/*",
        authorization: "Basic dGVzdDo=",
        "cloudfront-forwarded-proto": "https",
        "cloudfront-is-desktop-viewer": "true",
        "cloudfront-is-mobile-viewer": "false",
        "cloudfront-is-smarttv-viewer": "false",
        "cloudfront-is-tablet-viewer": "false",
        "cloudfront-viewer-country": "US",
        host: "mock-api.appsmith.com",
        test: "val",
        "user-agent": "ReactorNetty/1.0.15",
        via: "1.1 290e11478c5b9149e389233998147082.cloudfront.net (CloudFront)",
        "x-amz-cf-id":
          "xKBvLoL6ObBLGeqyky6ZuXl2I9ZgQu58BKzcYvR5VDgDdKgCexv8Zg==",
        "x-amzn-trace-id": "Root=1-627ba66a-2f010d2a5dcfb14009419780",
        "x-forwarded-for": "18.223.74.85, 64.252.147.156",
        "x-forwarded-port": "443",
        "x-forwarded-proto": "https",
        "x-request-id": "2c751e3c-7d54-4f08-908a-a9c909d4f12b",
        "content-length": 0,
      },
    },
    responseMeta: {
      statusCode: "200 OK",
      isExecutionSuccess: true,
      headers: {
        "Content-Type": ["application/json; charset=utf-8"],
        Connection: ["keep-alive"],
        Date: ["Wed, 11 May 2022 12:04:58 GMT"],
        "x-amzn-RequestId": ["2c751e3c-7d54-4f08-908a-a9c909d4f12b"],
        "x-amzn-Remapped-content-length": ["802"],
        "x-amz-apigw-id": ["R9bwsHujiYcF0IQ="],
        etag: ['W/"322-KKw8fZnypLi/dqYHfS13soe8o2s"'],
        "x-powered-by": ["Express"],
        "X-Amzn-Trace-Id": [
          "Root=1-627ba66a-2f010d2a5dcfb14009419780;Sampled=0",
        ],
        "X-Cache": ["Miss from cloudfront"],
        Via: [
          "1.1 290e11478c5b9149e389233998147082.cloudfront.net (CloudFront)",
        ],
        "X-Amz-Cf-Pop": ["YTO50-C1"],
        "X-Amz-Cf-Id": [
          "xKBvLoL6ObBLGeqyky6ZuXl2I9ZgQu58BKzcYvR5VDgDdKgCexv8Zg==",
        ],
        "content-length": ["802"],
        "X-APPSMITH-DATATYPE": ["JSON"],
      },
    },
    ENTITY_TYPE: ENTITY_TYPE.ACTION,
    isLoading: false,
    bindingPaths: {
      "config.path": EvaluationSubstitutionType.TEMPLATE,
      "config.body": EvaluationSubstitutionType.SMART_SUBSTITUTE,
    },
    reactivePaths: {
      data: EvaluationSubstitutionType.TEMPLATE,
      isLoading: EvaluationSubstitutionType.TEMPLATE,
      datasourceUrl: EvaluationSubstitutionType.TEMPLATE,
      "config.path": EvaluationSubstitutionType.TEMPLATE,
      "config.body": EvaluationSubstitutionType.SMART_SUBSTITUTE,
    },
    dependencyMap: {
      "config.body": ["config.pluginSpecifiedTemplates[0].value"],
    },
    logBlackList: {},
    datasourceUrl: "",
  },
  JSObject1: {
    name: "JSObject1",
    actionId: "627217a38a368d6f1efcd0d8",
    pluginType: PluginType.JS,
    ENTITY_TYPE: ENTITY_TYPE.JSACTION,
    body:
      "export default { \n\tmyFun1: () => {\n\t\treturn JSObject2.callApi();\n\t},\n}",
    meta: {
      myFun1: {
        arguments: [],
        isAsync: false,
        confirmBeforeExecute: false,
      },
    },
    bindingPaths: {
      body: EvaluationSubstitutionType.SMART_SUBSTITUTE,
      myFun1: EvaluationSubstitutionType.SMART_SUBSTITUTE,
    },
    reactivePaths: {
      body: EvaluationSubstitutionType.SMART_SUBSTITUTE,
      myFun1: EvaluationSubstitutionType.SMART_SUBSTITUTE,
    },
    dynamicBindingPathList: [
      {
        key: "body",
      },
      {
        key: "myFun1",
      },
    ],
    variables: [],
    dependencyMap: {
      body: ["myFun1"],
    },
    myFun1: {
      data: {},
    },
  },
  JSObject2: {
    name: "JSObject2",
    actionId: "627babc60b47255c28138865",
    pluginType: PluginType.JS,
    ENTITY_TYPE: ENTITY_TYPE.JSACTION,
    body:
      "export default {\n\tcallApi: () => {\n\t\treturn Api1.run()\n\t},\n}",
    meta: {
      callApi: {
        arguments: [],
        isAsync: false,
        confirmBeforeExecute: false,
      },
    },
    bindingPaths: {
      body: EvaluationSubstitutionType.SMART_SUBSTITUTE,
      callApi: EvaluationSubstitutionType.SMART_SUBSTITUTE,
    },
    reactivePaths: {
      body: EvaluationSubstitutionType.SMART_SUBSTITUTE,
      callApi: EvaluationSubstitutionType.SMART_SUBSTITUTE,
    },
    dynamicBindingPathList: [
      {
        key: "body",
      },
      {
        key: "callApi",
      },
    ],
    variables: [],
    dependencyMap: {
      body: ["callApi"],
    },
    callApi: {
      data: {},
    },
  },
  MainContainer: ({
    widgetName: "MainContainer",
    backgroundColor: "none",
    rightColumn: 4896,
    snapColumns: 64,
    detachFromLayout: true,
    widgetId: "0",
    topRow: 0,
    bottomRow: 1320,
    containerStyle: "none",
    snapRows: 125,
    parentRowSpace: 1,
    type: "CANVAS_WIDGET",
    canExtend: true,
    version: 57,
    minHeight: 1292,
    parentColumnSpace: 1,
    dynamicBindingPathList: [],
    leftColumn: 0,
    children: [],
    defaultProps: {},
    defaultMetaProps: [],
    logBlackList: {},
    meta: {},
    propertyOverrideDependency: {},
    overridingPropertyPaths: {},
    bindingPaths: {},
    reactivePaths: {},
    triggerPaths: {},
    validationPaths: {},
    ENTITY_TYPE: ENTITY_TYPE.WIDGET,
    privateWidgets: {},
  } as unknown) as DataTreeWidget,
  pageList: [
    {
      pageName: "Page1",
      pageId: "6272179d8a368d6f1efcd0d2",
      isDefault: true,
      isHidden: false,
      slug: "page1",
    },
  ],
  appsmith: ({
    user: {
      email: "anand@appsmith.com",
      organizationIds: [
        "61431979a67ce2289d3c7c6d",
        "61431a95a67ce2289d3c7c74",
        "5f7add8687af934ed846dd6a",
        "5f9fd13993794869fdbb8dcb",
        "618b5af5da7cd651ee273112",
        "604ef1c5c046f668d7bcc051",
        "61b3389cd3e4214454c26bd1",
        "61b3389cd3e4214454c26bd2",
        "620a0d896b4b1e154a3c057a",
        "620b37296b4b1e154a3c1fd7",
        "60c1a5273535574772b6377b",
        "6066e71a034ece74b1481ad2",
        "623b36e34d9aea1b062b15b3",
        "623b37de4d9aea1b062b170f",
        "624fe51b457aa64da9e02ed3",
        "6176537b515e45415cc7fd15",
        "6206486d6b4b1e154a3be208",
      ],
      username: "anand@appsmith.com",
      name: "Anand Srinivasan",
      enableTelemetry: true,
      idToken: {
        sub: "109879730040206968321",
        email_verified: true,
        name: "Anand Srinivasan",
        given_name: "Anand",
        locale: "en",
        hd: "appsmith.com",
        family_name: "Srinivasan",
        picture:
          "https://lh3.googleusercontent.com/a-/AOh14Gi4HfYY0sKhaG93YAHB_E5-dL4BkFxdf8ZfQ2w7=s96-c",
        email: "anand@appsmith.com",
      },
      accountNonExpired: true,
      accountNonLocked: true,
      credentialsNonExpired: true,
      emptyInstance: false,
      isAnonymous: false,
      isEnabled: true,
      isSuperUser: false,
      isConfigurable: true,
    },
    URL: {
      fullPath:
        "https://app.appsmith.com/app/untitled-application-25/page1-6272179d8a368d6f1efcd0d2/edit",
      host: "app.appsmith.com",
      hostname: "app.appsmith.com",
      queryParams: {},
      protocol: "https:",
      pathname:
        "/app/untitled-application-25/page1-6272179d8a368d6f1efcd0d2/edit",
      port: "",
      hash: "",
    },
    store: {},
    geolocation: {
      canBeRequested: true,
    },
    mode: "EDIT",
    ENTITY_TYPE: ENTITY_TYPE.APPSMITH,
  } as unknown) as DataTreeAppsmith,
};
