(function () {
    'use strict';
    angular.module('timeTargetingModule', [])
        .service('defaultTimeAdapter', [function () {
            return {
                caps: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                objToString: function (obj, fix_errors) {
                    var result = '';
                    var strByDay;
                    var day = 0;
                    fix_errors = fix_errors || false;
                    for (var d in obj) {
                        if (!obj.hasOwnProperty(d)) {
                            continue;
                        }
                        day++;
                        strByDay = '';

                        for (var h in obj[d]) {
                            if (obj[d][h]) {
                                strByDay += this.caps.charAt(h);
                            }
                        }
                        if (day == 8 && strByDay.length) {
                            var fullStr = this.caps.slice(this.caps.indexOf(strByDay[0]), this.caps.indexOf(strByDay[strByDay.length-1])+1);
                            if (strByDay != fullStr && fix_errors) {
                                for (var r = this.caps.indexOf(strByDay[0]); r < this.caps.indexOf(strByDay[strByDay.length-1])+1; r++) {
                                    obj[d][r] = 1;
                                }
                                strByDay = fullStr;
                            }
                        }

                        if (strByDay.length) {
                            result += day + strByDay;
                        }
                    }
                    return result;
                },
                stringToObj: function(str, obj) {
                    function isNumeric(n) {
                        return !isNaN(parseFloat(n)) && isFinite(n);
                    }
                    for (var d in obj) {
                        for (var h in obj[d]) {
                            if (obj[d][h]) {
                                obj[d][h] = false;
                            }
                        }
                    }
                    if (str.length) {
                        for (var i in str) {
                            if (str.hasOwnProperty(i) && isNumeric(str[i])) {
                                for (var n = i; n < str.length; n++) {
                                    if (n == i) {
                                        continue;
                                    }
                                    if (isNumeric(str[n])) {
                                        break;
                                    } else {
                                        console.log(str[i]);
                                        console.log(this.caps.indexOf(str[n]));
                                        obj[str[i]-1][this.caps.indexOf(str[n])] = 1;
                                    }
                                }
                            }
                        }
                    }
                },
                isHolidaysValid: function (obj) {
                    var result = false;
                    var strByDay;
                    var day = 0;
                    for (var d in obj) {
                        day++;
                        if (day != 8) {
                            continue;
                        }
                        strByDay = '';

                        for (var h in obj[d]) {
                            if (obj[d][h]) {
                                strByDay += this.caps.charAt(h);
                            }
                        }
                        if (strByDay.length) {
                            var fullStr = this.caps.slice(this.caps.indexOf(strByDay[0]), this.caps.indexOf(strByDay[strByDay.length-1])+1);
                            if (strByDay == fullStr) {
                                result = true;
                            }
                        } else {
                            result = true;
                        }
                    }
                    return result;
                }
            }
        }])
        .component('timeTargetingComponent', {
            bindings: {
                model: '='
            },
            templateUrl: 'timeTargetingComponent.html',
            controller: ['$timeout', timeTargetingController]
        });

    function timeTargetingController($timeout) {
        var vm = this;

        vm.selectValue = 0;
        vm.selectStartDay = '';
        vm.selectStartHour = '';

        vm.selectStartDayFor = 0;
        vm.selectEndDayFor = 0;
        vm.selectStartHourFor = 0;
        vm.selectEndHourFor = 0;

        vm.defaultSelectValue = 1;

        vm.$onInit = function() {
            for (var d = 0; d < vm.model.days.length; d++) {
                vm.model.grid[d] = {};
                for (var h = 0; h < vm.model.hours.length; h++) {
                    vm.model.grid[d][h] = 0;
                }
            }
        };

        vm.selectStart = function (dayIndex, hourIndex) {
            vm.selectStartDay = dayIndex;
            vm.selectStartHour = hourIndex;
            if (vm.model.grid[dayIndex][hourIndex]) {
                vm.selectValue = 0;
            } else {
                vm.selectValue = 1;
            }

            angular.element(document).one('mouseup', function() {
                vm.selectEnd();
            });
        };

        vm.selectEnter = function(dayIndex, hourIndex) {
            if (vm.selectStartDay > dayIndex) {
                vm.selectStartDayFor = dayIndex;
                vm.selectEndDayFor = vm.selectStartDay;
            } else {
                vm.selectStartDayFor = vm.selectStartDay;
                vm.selectEndDayFor = dayIndex;
            }

            if (vm.selectStartHour > hourIndex) {
                vm.selectStartHourFor = hourIndex;
                vm.selectEndHourFor = vm.selectStartHour;
            } else {
                vm.selectStartHourFor = vm.selectStartHour;
                vm.selectEndHourFor = hourIndex;
            }

            if (vm.selectStartDay !== '') {
                for (var d = vm.selectStartDayFor; d <= vm.selectEndDayFor; d++) {
                    for (var h = vm.selectStartHourFor; h <= vm.selectEndHourFor; h++) {
                        vm.model.grid[d][h] = vm.selectValue;
                    }
                }
            }
        };

        vm.selectColumn = function (index) {
            var selected = 1;
            for (var d = 0; d < vm.model.days.length; d++) {
                if (vm.model.grid[d][index] == 0) {
                    selected = 0;
                    break;
                }
            }
            vm.selectValue = selected ? 0 : 1;
            for (d = 0; d < vm.model.days.length; d++) {
                vm.model.grid[d][index] = vm.selectValue;
            }
            vm.model.onChange();
        };

        vm.selectRow = function (index) {
            var selected = 1;
            for (var h = 0; h < vm.model.hours.length; h++) {
                if (vm.model.grid[index][h] == 0) {
                    selected = 0;
                    break;
                }
            }
            vm.selectValue = selected ? 0 : 1;
            for (h = 0; h < vm.model.hours.length; h++) {
                vm.model.grid[index][h] = vm.selectValue;
            }
            vm.model.onChange();
        };

        vm.selectByCoords = function (index) {
            if (index != -1 && vm.model.buttons[index].noclear) {
                vm.model.onChange();
                return;
            }

            for (var d = 0; d < vm.model.days.length; d++) {
                for (var h = 0; h < vm.model.hours.length; h++) {
                    vm.model.grid[d][h] = 0;
                }
            }

            if (index === -1) {
                vm.model.onChange();
                return;
            }

            if (vm.model.buttons[index].coords.length) {
                vm.selectStartDayFor = vm.model.buttons[index].coords[0];
                vm.selectEndDayFor = vm.model.buttons[index].coords[2];
                vm.selectStartHourFor = vm.model.buttons[index].coords[1];
                vm.selectEndHourFor = vm.model.buttons[index].coords[3];

                for (d = vm.selectStartDayFor; d <= vm.selectEndDayFor; d++) {
                    for (h = vm.selectStartHourFor; h <= vm.selectEndHourFor; h++) {
                        vm.model.grid[d][h] = vm.defaultSelectValue;
                    }
                }
            }
            vm.model.onChange();
        };

        vm.selectEnd = function () {
            vm.selectStartDay = '';
            vm.selectStartHour = '';
            vm.model.onChange();
        };

        vm.selectTimeTargeting = function(index) {
            for (var i = 0; i < vm.model.buttons.length; i++) {
                vm.model.buttons[i].selected = false;
            }
            vm.model.buttons[index].selected = true;
            vm.selectByCoords(index);
        };
    }
})();