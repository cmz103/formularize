enum FieldType {
    text,
    selectone,
    selectmultiple,
    checkbox,
    radio,
    textarea,
    button,
    submit,
    hidden
}

class Form {
    public formId: string;
    public btnSubmitId: string;
    private initFields: any;
    private initMethods: void;
    private arrayValues: any;

    constructor(formId: string, btnSubmitId?: string) {
        this.formId = formId;
        this.btnSubmitId = btnSubmitId;
        this.initFields = this.getFields();
        this.initMethods = this.runInternalMethods();
        this.arrayValues = {};
    }

    public getDetailFields = (): JQuerySerializeArrayElement[] => {
        //debugger;
        let fields = $("#" + this.formId).find(":input").serializeArray();
        return fields;
    }

    public getFields = (): JQuerySerializeArrayElement[] => {
        //debugger;
        let fields: any = [];
        let formFields = $("#" + this.formId).find(":input");
        _.forEach(formFields, (value: HTMLInputElement, key) => {
            if (value.name !== "" && value.name !== undefined) {

                if ($(value).hasClass("multiSelect")) {
                    let arrVal: any = $(value).val();

                    if (arrVal.length === 0) {
                        fields.push({
                            name: value.name,
                            value: ""
                        });
                    } else {
                        for (var i = 0; i < arrVal.length; i++) {
                            fields.push({
                                name: value.name,
                                value: arrVal[i]
                            });
                        }
                    }

                } else if (value.checked == false && value.type == "radio") {

                } else {
                    fields.push({
                        name: value.name,
                        value: value.value
                    });
                }
            }
        });

        return fields;
    }

    public clearFields = (ignore?: string): void => {
        this.arrayValues = {};
        //TODO: Implement - Create optional parameter to set field value to while clearing

        //debugger;
        let inputs = $("#" + this.formId).find(":input").not(ignore);

        _.forEach(inputs, (value: HTMLInputElement, key) => {
            //remove dashes for select-one and select-multiple
            let type: string = value.type.indexOf("-") != -1 ? value.type.replace("-", "") : value.type;

            if (value.className === "btn dropdown-toggle btn-default") {
                let className = "." + value.className.split(" ").join(".");
                let dropdown = $(className).next().next();

                for (var i = 0; i < dropdown.length; i++) {
                    $("#" + dropdown[i].id).selectpicker('deselectAll');                    
                }

            }
            
            //if we don't cast any here, ts throws an error
            //because 'type' is a string but it is expecting a number
            //but we can access the enum value using a string
            //https://basarat.gitbooks.io/typescript/docs/enums.html
            
            switch (FieldType[<any>FieldType[<any>type]]) {
                case FieldType[FieldType.button]:
                case FieldType[FieldType.submit]:                   
                    break;
                case FieldType[FieldType.text]:            
                case FieldType[FieldType.selectmultiple]:
                case FieldType[FieldType.textarea]:
                case FieldType[FieldType.hidden]:                                                                 
                        value.value = "";                    
                    break;
                case FieldType[FieldType.checkbox]:
                case FieldType[FieldType.radio]:
                    if (value.value != "All") {
                        value.checked = false;
                    } else {
                        value.checked = true;                        
                    }
                    break;
                case FieldType[FieldType.selectone]:
                    if ($(value).hasClass("datepicker-select")) {
                        $("[name='" + value.name + "']").val("Day");
                        $("[name='" + value.name + "']").selectpicker('render');
                    } else {
                        value.value = "";
                    }
                    break;
                default:
                    break;
            }
        });

        //this.clearMultiSelect();

        if (this.btnSubmitId != null) {
            $("#" + this.btnSubmitId).button("enable");
        }
    };

    public resetValues = (): void => {
        //debugger;
        let doesResetExist = $("#" + this.formId).find("[type='reset']").length;

        if (!doesResetExist) {
            $("<button type='reset' style='display:none'></button>").appendTo($("#" + this.formId)).trigger("click");
        }
        else {
            $("#" + this.formId).find("[type='reset']").trigger("click");
        }
    };

    private clearMultiSelect = (): void => {
        //debugger;
        let multiselect = $("#" + this.formId).find(".multiSelect");
        if (multiselect.length) {
            _.forEach(multiselect, (value, key) => {
                $(value).find("span").text("");
            });
        }
        //let multiselect = $('.multiSelect');
        //if (multiselect.length) {
            
        //    _.forEach(multiselect, (value, key) => {
        //        value.sumo.unSelectAll();
        //        value.sumo.reload();
        //    });
        //}

    };

    private resetMultiSelect = (): void => {
        //debugger;
        let multiselect = $("#" + this.formId).find(".multiSelect");
        let multiselectOptions = $("#" + this.formId).find(".multiSelectOptions");
        let selected: string[] = [];

        if (multiselect.length && multiselectOptions.length) {
            //debugger;

            _.forEach(multiselectOptions, (value: any, key: number) => {
                let checked = $(value).find("label").find(":checked");
                _.forEach(checked, (value, key) => {
                    selected.push($(value).parent().text());
                });

                $(value).prev(".multiSelect").find("span").text(selected.join());
            });

            //let checked = multiselectOptions.find(":checked");
            //console.log(checked.parent().text())
        }
    };

    private watchEnterKey = (): void => {

        let inputs = $("#" + this.formId).find(":input");
        let form = $("#" + this.formId);
        
        form.keydown((e): void => {
            if ($(".btn-group.bootstrap-select.show-tick.form-control.multiSelect.open")[0] && e.keyCode == 13 ||
                $(".btn-group.bootstrap-select.form-control.singleSelect.open")[0] && e.keyCode == 13 ||
                e.target.className === "btn dropdown-toggle btn-default" && e.keyCode == 13 ||
                e.target.className == "btn dropdown-toggle btn-default bs-placeholder" && e.keyCode == 13) {
                //console.log("Box is open");
            }
            else if (e.keyCode == 13) {

                //don't trigger click if button is disabled
                if (!$("#" + this.btnSubmitId).is(":disabled")) {
                    $("#" + this.btnSubmitId).trigger("click");
                }
            }
        });
    };

    private runInternalMethods = (): void => {
        //debugger;
        this.watchEnterKey();
    };

    public getId = (): string => {
        return this.formId;
    }

    public instance = (): any => {
        return $("#" + this.formId);
    };

    public populateForm = (obj: any, search?: boolean): any => {
        //TODO: implement interface for obj {name, value }/ refactor
        //debugger;

        _.forOwn(obj, (value, key): void => {

            let elementType: string = $("[name='" + value.name + "']").prop("type").indexOf("-") != -1 ? $("[name='" + value.name + "']").prop("type").replace("-", "") : $("[name='" + value.name + "']").prop("type");
            
            //checkbox group or radio group
            if (elementType === "" && $("[name='" + value.name + "'][value='" + value.value + "']").is(":checkbox")) {
                $("[name='" + value.name + "'][value='" + value.value + "']").prop("checked", true);
            }
          
            else {
                switch (elementType) {
                    case FieldType[FieldType.button]:
                    case FieldType[FieldType.submit]:
                        break;
                    case FieldType[FieldType.text]:                    
                    case FieldType[FieldType.textarea]:
                    case FieldType[FieldType.hidden]:
                        if (value.value === "null") {
                            $("[name='" + value.name + "']").val("");
                            $("[name='" + value.name + "']").trigger("change");
                        } else {
                            $("[name='" + value.name + "']").val(value.value);
                            $("[name='" + value.name + "']").trigger("change");
                        }
                        break;
                    case FieldType[FieldType.selectone]:
                        if (value.value === "null" && search === true) {
                            $("[name='" + value.name + "']").val("");
                            $("[name='" + value.name + "']").selectpicker('render');
                            $("[name='" + value.name + "']").trigger("change");
                            
                        } else if (search === true) {
                            $("[name='" + value.name + "']").val(value.value);
                            $("[name='" + value.name + "']").selectpicker('render');
                            $("[name='" + value.name + "']").trigger("change");
                            
                        } else if (value.value === "null" && search === false) {
                            $("[name='" + value.name + "']").val(value.value);
                            $("[name='" + value.name + "']").selectpicker('render');
                            $("[name='" + value.name + "']").trigger("change");
                        } else {
                            $("[name='" + value.name + "']").val(value.value);
                            $("[name='" + value.name + "']").selectpicker('render');
                            $("[name='" + value.name + "']").trigger("change");
                        }
                        break;
                    case FieldType[FieldType.selectmultiple]:
                        let name = value.name;
                        let values = value.value;
                        //if (values == "") {
                        //    $("[name='" + value.name + "']").selectpicker('deselectAll');
                        //} else {                            
                        //    this.createArrays(name, values);
                        //}                                          
                        this.createArrays(name, values);

                    case FieldType[FieldType.radio]:
                        if (value.value === "null") {
                            $("[name='" + value.name + "'][value='All']").prop("checked", true);
                        } else {
                            $("[name='" + value.name + "'][value='" + value.value + "']").prop("checked", true);
                        }
                        break;
                    default:
                        break;
                }
            }
        });

        //Populate dropdowns after arrays have been created
        _.forOwn(this.arrayValues, (value, key): void => {
            this.setDropdowns(key, value);
        });

    };

    //private getFieldType =

    private setDateRange = (): void => {
        
    }

    private setDropdowns = (name: string, options: string): void => {    
        $("[name='" + name + "']").selectpicker('val', options);
    }

    private createArrays = (name: string, values: string): void => {
        if (!this.arrayValues[name]) {
            this.arrayValues[name] = [values];
        } else {
            this.arrayValues[name].push(values);
        }
    }

    public serialize = () => {
        let formValues = this.getFields();

        _.forOwn(formValues, (value, key): void => {
            if (value.value === null || value.value === "" || _.toLower(value.value) === "all") {
                value.value = "null";
            };
        });

        return $.param(formValues);
    }
}