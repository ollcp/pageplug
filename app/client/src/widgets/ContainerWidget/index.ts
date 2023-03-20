import { ButtonBoxShadowTypes } from "components/constants";
import { Colors } from "constants/Colors";
import { GridDefaults, WidgetHeightLimits } from "constants/WidgetConstants";
import { WidgetProps } from "widgets/BaseWidget";
import IconSVG from "./icon.svg";
import Widget from "./widget";

export const CONFIG = {
  type: Widget.getWidgetType(),
  name: "容器",
  iconSVG: IconSVG,
  isCanvas: true,
  features: {
    dynamicHeight: {
      sectionIndex: 0,
      active: true,
    },
  },
  canvasHeightOffset: (props: WidgetProps): number => {
    const offset =
      props.borderWidth && props.borderWidth > 1
        ? Math.ceil(
            (2 * parseInt(props.borderWidth, 10) || 0) /
              GridDefaults.DEFAULT_GRID_ROW_HEIGHT,
          )
        : 0;

    return offset;
  },
  searchTags: ["div", "parent", "group", "container"],
  defaults: {
    backgroundColor: "#FFFFFF",
    rows: WidgetHeightLimits.MIN_CANVAS_HEIGHT_IN_ROWS,
    columns: 24,
    widgetName: "Container",
    containerStyle: "card",
    borderColor: Colors.GREY_5,
    borderWidth: "1",
    boxShadow: ButtonBoxShadowTypes.NONE,
    animateLoading: true,
    children: [],
    blueprint: {
      view: [
        {
          type: "CANVAS_WIDGET",
          position: { top: 0, left: 0 },
          props: {
            containerStyle: "none",
            canExtend: false,
            detachFromLayout: true,
            children: [],
          },
        },
      ],
    },
    version: 1,
  },
  properties: {
    derived: Widget.getDerivedPropertiesMap(),
    default: Widget.getDefaultPropertiesMap(),
    meta: Widget.getMetaPropertiesMap(),
    config: Widget.getPropertyPaneConfig(),
    contentConfig: Widget.getPropertyPaneContentConfig(),
    styleConfig: Widget.getPropertyPaneStyleConfig(),
    stylesheetConfig: Widget.getStylesheetConfig(),
  },
};

export default Widget;
