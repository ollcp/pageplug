import React from "react";
import BaseWidget, { WidgetProps, WidgetState } from "./BaseWidget";
import { WidgetType } from "constants/WidgetConstants";
import { ActionPayload, TableAction } from "constants/ActionConstants";
import { forIn } from "lodash";
import TableComponent from "components/designSystems/syncfusion/TableComponent";

import { VALIDATION_TYPES } from "constants/WidgetValidation";
import { WidgetPropertyValidationType } from "utils/ValidationFactory";
import { ColumnModel } from "@syncfusion/ej2-grids";
import { ColumnDirTypecast } from "@syncfusion/ej2-react-grids";
import { ColumnAction } from "components/propertyControls/ColumnActionSelectorControl";

function constructColumns(data: object[]): ColumnModel[] | ColumnDirTypecast[] {
  const cols: ColumnModel[] | ColumnDirTypecast[] = [];
  const listItemWithAllProperties = {};
  data.forEach(dataItem => {
    Object.assign(listItemWithAllProperties, dataItem);
  });
  forIn(listItemWithAllProperties, (value: any, key: string) => {
    cols.push({
      field: key,
      width: 200,
    });
  });
  return cols;
}

class TableWidget extends BaseWidget<TableWidgetProps, WidgetState> {
  static getPropertyValidationMap(): WidgetPropertyValidationType {
    return {
      tableData: VALIDATION_TYPES.TABLE_DATA,
      nextPageKey: VALIDATION_TYPES.TEXT,
      prevPageKey: VALIDATION_TYPES.TEXT,
      label: VALIDATION_TYPES.TEXT,
      selectedRowIndex: VALIDATION_TYPES.NUMBER,
    };
  }
  static getDerivedPropertiesMap() {
    return {
      selectedRow: "{{this.tableData[this.selectedRowIndex]}}",
    };
  }

  getPageView() {
    const { tableData } = this.props;
    const columns = constructColumns(tableData);

    const serverSidePaginationEnabled = this.context.paginatedWidgets.includes(
      this.props.widgetId,
    );
    return (
      <TableComponent
        data={this.props.tableData}
        columns={columns}
        isLoading={this.props.isLoading}
        height={this.state.componentHeight}
        width={this.state.componentWidth}
        disableDrag={(disable: boolean) => {
          this.disableDrag(disable);
        }}
        columnActions={this.props.columnActions}
        onCommandClick={this.onCommandClick}
        onRowClick={(rowData: object, index: number) => {
          const { onRowSelected } = this.props;
          this.updateSelectedRowProperty(index);

          super.executeAction(onRowSelected);
        }}
        serverSidePaginationEnabled={serverSidePaginationEnabled}
        pageNo={1}
        nextPageClick={() => {
          super.executeAction(this.props.onPageChange, "NEXT");
        }}
        prevPageClick={() => {
          super.executeAction(this.props.onPageChange, "PREV");
        }}
      />
    );
  }

  onCommandClick = (actions: ActionPayload[]) => {
    super.executeAction(actions);
  };

  updateSelectedRowProperty(index: number) {
    const { widgetId } = this.props;
    this.updateWidgetProperty(widgetId, "selectedRowIndex", index);
  }

  getWidgetType(): WidgetType {
    return "TABLE_WIDGET";
  }
}

export type PaginationType = "PAGES" | "INFINITE_SCROLL";

type RowData = {
  rowIndex: number;
};
type SelectedRow = object & RowData;

export interface TableWidgetProps extends WidgetProps {
  nextPageKey?: string;
  prevPageKey?: string;
  label: string;
  tableData: object[];
  recordActions?: TableAction[];
  onPageChange?: ActionPayload[];
  onRowSelected?: ActionPayload[];
  selectedRowIndex?: number;
  columnActions?: ColumnAction[];
}

export default TableWidget;
