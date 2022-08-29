import { ValidationTypes } from "constants/WidgetValidation";
import { updateColumnStyles } from "../propertyUtils";

export default {
  sectionName: "样式",
  children: [
    {
      propertyName: "cellBackground",
      label: "Cell Background Color",
      controlType: "COLOR_PICKER",
      updateHook: updateColumnStyles,
      dependencies: ["primaryColumns"],
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
    },
    {
      propertyName: "accentColor",
      label: "强调色",
      controlType: "COLOR_PICKER",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
      invisible: true,
    },
    {
      propertyName: "textColor",
      label: "文本颜色",
      controlType: "COLOR_PICKER",
      updateHook: updateColumnStyles,
      dependencies: ["primaryColumns"],
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
    },
    {
      propertyName: "textSize",
      label: "字体大小",
      controlType: "DROP_DOWN",
      updateHook: updateColumnStyles,
      dependencies: ["primaryColumns"],
      options: [
        {
          label: "S",
          value: "0.875rem",
          subText: "0.875rem",
        },
        {
          label: "M",
          value: "1rem",
          subText: "1rem",
        },
        {
          label: "L",
          value: "1.25rem",
          subText: "1.25rem",
        },
        {
          label: "XL",
          value: "1.875rem",
          subText: "1.875rem",
        },
      ],
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
    },
    {
      propertyName: "fontStyle",
      label: "Font Style",
      controlType: "BUTTON_TABS",
      updateHook: updateColumnStyles,
      dependencies: ["primaryColumns"],
      options: [
        {
          icon: "BOLD_FONT",
          value: "BOLD",
        },
        {
          icon: "ITALICS_FONT",
          value: "ITALIC",
        },
      ],
      isBindProperty: false,
      isTriggerProperty: false,
    },
    {
      propertyName: "horizontalAlignment",
      label: "Text Align",
      controlType: "ICON_TABS",
      updateHook: updateColumnStyles,
      dependencies: ["primaryColumns"],
      options: [
        {
          icon: "LEFT_ALIGN",
          value: "LEFT",
        },
        {
          icon: "CENTER_ALIGN",
          value: "CENTER",
        },
        {
          icon: "RIGHT_ALIGN",
          value: "RIGHT",
        },
      ],
      defaultValue: "LEFT",
      isBindProperty: false,
      isTriggerProperty: false,
    },
    {
      propertyName: "verticalAlignment",
      label: "Vertical Alignment",
      controlType: "ICON_TABS",
      updateHook: updateColumnStyles,
      dependencies: ["primaryColumns"],
      options: [
        {
          icon: "VERTICAL_TOP",
          value: "TOP",
        },
        {
          icon: "VERTICAL_CENTER",
          value: "CENTER",
        },
        {
          icon: "VERTICAL_BOTTOM",
          value: "BOTTOM",
        },
      ],
      defaultValue: "LEFT",
      isBindProperty: false,
      isTriggerProperty: false,
    },
    {
      propertyName: "borderRadius",
      label: "边框圆角",
      helpText: "边框圆角样式",
      controlType: "BORDER_RADIUS_OPTIONS",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
    },
    {
      propertyName: "boxShadow",
      label: "阴影",
      helpText:
        "组件轮廓投影",
      controlType: "BOX_SHADOW_OPTIONS",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
    },
  ],
};