import { BUTTON_MIN_WIDTH } from "constants/minWidthConstants";
import { ResponsiveBehavior } from "utils/autoLayout/constants";
import FileDataTypes from "./constants";
import IconSVG from "./icon.svg";
import Widget from "./widget";
import { WIDGET_TAGS } from "constants/WidgetConstants";

export const CONFIG = {
  type: Widget.getWidgetType(),
  name: "文件上传",
  iconSVG: IconSVG,
  tags: [WIDGET_TAGS.INPUTS],
  needsMeta: true,
  searchTags: ["upload", "file picker"],
  defaults: {
    rows: 4,
    files: [],
    selectedFiles: [],
    allowedFileTypes: [],
    label: "选择文件",
    columns: 16,
    maxNumFiles: 1,
    maxFileSize: 5,
    fileDataType: FileDataTypes.Base64,
    dynamicTyping: true,
    widgetName: "FilePicker",
    isDefaultClickDisabled: true,
    version: 1,
    isRequired: false,
    isDisabled: false,
    animateLoading: false,
    responsiveBehavior: ResponsiveBehavior.Hug,
    minWidth: BUTTON_MIN_WIDTH,
  },
  properties: {
    derived: Widget.getDerivedPropertiesMap(),
    default: Widget.getDefaultPropertiesMap(),
    meta: Widget.getMetaPropertiesMap(),
    config: Widget.getPropertyPaneConfig(),
    styleConfig: Widget.getPropertyPaneStyleConfig(),
    contentConfig: Widget.getPropertyPaneContentConfig(),
    stylesheetConfig: Widget.getStylesheetConfig(),
    autocompleteDefinitions: Widget.getAutocompleteDefinitions(),
    setterConfig: Widget.getSetterConfig(),
  },
  autoLayout: {
    defaults: {
      rows: 4,
      columns: 6.632,
    },
    autoDimension: {
      width: true,
    },
    widgetSize: [
      {
        viewportMinWidth: 0,
        configuration: () => {
          return {
            minWidth: "120px",
            maxWidth: "360px",
            minHeight: "40px",
          };
        },
      },
    ],
    disableResizeHandles: {
      horizontal: true,
      vertical: true,
    },
  },
};

export default Widget;
