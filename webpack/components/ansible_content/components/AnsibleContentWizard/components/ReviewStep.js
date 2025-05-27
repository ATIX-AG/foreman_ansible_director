import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Button, DataList, DataListItem, DataListCell, DataListItemRow, DataListItemCells, DataListAction, ChipGroup, Chip, } from '@patternfly/react-core';
export const ReviewStep = ({ contentUnits, setContentUnits, }) => {
    const deleteUnitVersion = (unit, version) => {
        unit.versions = unit.versions.filter(unitVersion => unitVersion.version !== version);
        setContentUnits(units => [...units]);
    };
    const deleteUnit = (index) => {
        contentUnits.splice(index, 1);
        setContentUnits(units => [...units]);
    };
    const listItems = () => contentUnits.map((unit, index) => (_jsx(DataListItem, { "aria-labelledby": "single-action-item1", children: _jsxs(DataListItemRow, { children: [_jsx(DataListItemCells, { dataListCells: [
                        _jsx(DataListCell, { children: _jsx("span", { id: "single-action-item1", children: unit.identifier }) }, "primary content"),
                        _jsx(DataListCell, { children: _jsx(ChipGroup, { children: unit.versions.map(version => (_jsx(Chip, { onClick: () => {
                                        deleteUnitVersion(unit, version.version);
                                    }, children: version.version }, `${unit.identifier}_${version.version}`))) }) }, "secondary content"),
                    ] }), _jsx(DataListAction, { "aria-labelledby": "single-action-item1 single-action-action1", id: "single-action-action1", "aria-label": "Actions", children: _jsx(Button, { onClick: () => {
                            deleteUnit(index);
                        }, variant: "danger", children: "Delete" }, "delete-action") })] }) })));
    return (_jsx(React.Fragment, { children: _jsx(DataList, { "aria-label": "single action data list example ", isCompact: true, children: listItems() }) }));
};
