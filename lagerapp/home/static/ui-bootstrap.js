/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.14.3 - 2015-10-23
 * License: MIT
 */
angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.dropdown", "ui.bootstrap.position", "ui.bootstrap.buttons"]), angular.module("ui.bootstrap.tpls", []), angular.module("ui.bootstrap.dropdown", ["ui.bootstrap.position"]).constant("uibDropdownConfig", {openClass: "open"}).service("uibDropdownService", ["$document", "$rootScope", function (e, n) {
    var o = null;
    this.open = function (n) {
        o || (e.bind("click", t), e.bind("keydown", i)), o && o !== n && (o.isOpen = !1), o = n
    }, this.close = function (n) {
        o === n && (o = null, e.unbind("click", t), e.unbind("keydown", i))
    };
    var t = function (e) {
        if (o && (!e || "disabled" !== o.getAutoClose())) {
            var t = o.getToggleElement();
            if (!(e && t && t[0].contains(e.target))) {
                var i = o.getDropdownElement();
                e && "outsideClick" === o.getAutoClose() && i && i[0].contains(e.target) || (o.isOpen = !1, n.$$phase || o.$apply())
            }
        }
    }, i = function (e) {
        27 === e.which ? (o.focusToggleElement(), t()) : o.isKeynavEnabled() && /(38|40)/.test(e.which) && o.isOpen && (e.preventDefault(), e.stopPropagation(), o.focusDropdownEntry(e.which))
    }
}]).controller("UibDropdownController", ["$scope", "$element", "$attrs", "$parse", "uibDropdownConfig", "uibDropdownService", "$animate", "$uibPosition", "$document", "$compile", "$templateRequest", function (e, n, o, t, i, r, l, s, d, u, a) {
    var p, c, f = this, g = e.$new(), w = i.openClass, b = angular.noop, h = o.onToggle ? t(o.onToggle) : angular.noop, $ = !1, v = !1;
    n.addClass("dropdown"), this.init = function () {
        o.isOpen && (c = t(o.isOpen), b = c.assign, e.$watch(c, function (e) {
            g.isOpen = !!e
        })), $ = angular.isDefined(o.dropdownAppendToBody), v = angular.isDefined(o.uibKeyboardNav), $ && f.dropdownMenu && (d.find("body").append(f.dropdownMenu), n.on("$destroy", function () {
            f.dropdownMenu.remove()
        }))
    }, this.toggle = function (e) {
        return g.isOpen = arguments.length ? !!e : !g.isOpen
    }, this.isOpen = function () {
        return g.isOpen
    }, g.getToggleElement = function () {
        return f.toggleElement
    }, g.getAutoClose = function () {
        return o.autoClose || "always"
    }, g.getElement = function () {
        return n
    }, g.isKeynavEnabled = function () {
        return v
    }, g.focusDropdownEntry = function (e) {
        var o = f.dropdownMenu ? angular.element(f.dropdownMenu).find("a") : angular.element(n).find("ul").eq(0).find("a");
        switch (e) {
            case 40:
                f.selectedOption = angular.isNumber(f.selectedOption) ? f.selectedOption === o.length - 1 ? f.selectedOption : f.selectedOption + 1 : 0;
                break;
            case 38:
                f.selectedOption = angular.isNumber(f.selectedOption) ? 0 === f.selectedOption ? 0 : f.selectedOption - 1 : o.length - 1
        }
        o[f.selectedOption].focus()
    }, g.getDropdownElement = function () {
        return f.dropdownMenu
    }, g.focusToggleElement = function () {
        f.toggleElement && f.toggleElement[0].focus()
    }, g.$watch("isOpen", function (o, t) {
        if ($ && f.dropdownMenu) {
            var i = s.positionElements(n, f.dropdownMenu, "bottom-left", !0), d = {
                top: i.top + "px",
                display: o ? "block" : "none"
            }, c = f.dropdownMenu.hasClass("dropdown-menu-right");
            c ? (d.left = "auto", d.right = window.innerWidth - (i.left + n.prop("offsetWidth")) + "px") : (d.left = i.left + "px", d.right = "auto"), f.dropdownMenu.css(d)
        }
        if (l[o ? "addClass" : "removeClass"](n, w).then(function () {
                angular.isDefined(o) && o !== t && h(e, {open: !!o})
            }), o)f.dropdownMenuTemplateUrl && a(f.dropdownMenuTemplateUrl).then(function (e) {
            p = g.$new(), u(e.trim())(p, function (e) {
                var n = e;
                f.dropdownMenu.replaceWith(n), f.dropdownMenu = n
            })
        }), g.focusToggleElement(), r.open(g); else {
            if (f.dropdownMenuTemplateUrl) {
                p && p.$destroy();
                var v = angular.element('<ul class="dropdown-menu"></ul>');
                f.dropdownMenu.replaceWith(v), f.dropdownMenu = v
            }
            r.close(g), f.selectedOption = null
        }
        angular.isFunction(b) && b(e, o)
    }), e.$on("$locationChangeSuccess", function () {
        "disabled" !== g.getAutoClose() && (g.isOpen = !1)
    });
    var m = e.$on("$destroy", function () {
        g.$destroy()
    });
    g.$on("$destroy", m)
}]).directive("uibDropdown", function () {
    return {
        controller: "UibDropdownController", link: function (e, n, o, t) {
            t.init()
        }
    }
}).directive("uibDropdownMenu", function () {
    return {
        restrict: "AC", require: "?^uibDropdown", link: function (e, n, o, t) {
            if (t && !angular.isDefined(o.dropdownNested)) {
                n.addClass("dropdown-menu");
                var i = o.templateUrl;
                i && (t.dropdownMenuTemplateUrl = i), t.dropdownMenu || (t.dropdownMenu = n)
            }
        }
    }
}).directive("uibKeyboardNav", function () {
    return {
        restrict: "A", require: "?^uibDropdown", link: function (e, n, o, t) {
            n.bind("keydown", function (e) {
                if (-1 !== [38, 40].indexOf(e.which)) {
                    e.preventDefault(), e.stopPropagation();
                    var n = t.dropdownMenu.find("a");
                    switch (e.which) {
                        case 40:
                            t.selectedOption = angular.isNumber(t.selectedOption) ? t.selectedOption === n.length - 1 ? t.selectedOption : t.selectedOption + 1 : 0;
                            break;
                        case 38:
                            t.selectedOption = angular.isNumber(t.selectedOption) ? 0 === t.selectedOption ? 0 : t.selectedOption - 1 : n.length - 1
                    }
                    n[t.selectedOption].focus()
                }
            })
        }
    }
}).directive("uibDropdownToggle", function () {
    return {
        require: "?^uibDropdown", link: function (e, n, o, t) {
            if (t) {
                n.addClass("dropdown-toggle"), t.toggleElement = n;
                var i = function (i) {
                    i.preventDefault(), n.hasClass("disabled") || o.disabled || e.$apply(function () {
                        t.toggle()
                    })
                };
                n.bind("click", i), n.attr({
                    "aria-haspopup": !0,
                    "aria-expanded": !1
                }), e.$watch(t.isOpen, function (e) {
                    n.attr("aria-expanded", !!e)
                }), e.$on("$destroy", function () {
                    n.unbind("click", i)
                })
            }
        }
    }
}), angular.module("ui.bootstrap.dropdown").value("$dropdownSuppressWarning", !1).service("dropdownService", ["$log", "$dropdownSuppressWarning", "uibDropdownService", function (e, n, o) {
    n || e.warn("dropdownService is now deprecated. Use uibDropdownService instead."), angular.extend(this, o)
}]).controller("DropdownController", ["$scope", "$element", "$attrs", "$parse", "uibDropdownConfig", "uibDropdownService", "$animate", "$uibPosition", "$document", "$compile", "$templateRequest", "$log", "$dropdownSuppressWarning", function (e, n, o, t, i, r, l, s, d, u, a, p, c) {
    c || p.warn("DropdownController is now deprecated. Use UibDropdownController instead.");
    var f, g, w = this, b = e.$new(), h = i.openClass, $ = angular.noop, v = o.onToggle ? t(o.onToggle) : angular.noop, m = !1, C = !1;
    n.addClass("dropdown"), this.init = function () {
        o.isOpen && (g = t(o.isOpen), $ = g.assign, e.$watch(g, function (e) {
            b.isOpen = !!e
        })), m = angular.isDefined(o.dropdownAppendToBody), C = angular.isDefined(o.uibKeyboardNav), m && w.dropdownMenu && (d.find("body").append(w.dropdownMenu), n.on("$destroy", function () {
            w.dropdownMenu.remove()
        }))
    }, this.toggle = function (e) {
        return b.isOpen = arguments.length ? !!e : !b.isOpen
    }, this.isOpen = function () {
        return b.isOpen
    }, b.getToggleElement = function () {
        return w.toggleElement
    }, b.getAutoClose = function () {
        return o.autoClose || "always"
    }, b.getElement = function () {
        return n
    }, b.isKeynavEnabled = function () {
        return C
    }, b.focusDropdownEntry = function (e) {
        var o = w.dropdownMenu ? angular.element(w.dropdownMenu).find("a") : angular.element(n).find("ul").eq(0).find("a");
        switch (e) {
            case 40:
                w.selectedOption = angular.isNumber(w.selectedOption) ? w.selectedOption === o.length - 1 ? w.selectedOption : w.selectedOption + 1 : 0;
                break;
            case 38:
                w.selectedOption = angular.isNumber(w.selectedOption) ? 0 === w.selectedOption ? 0 : w.selectedOption - 1 : o.length - 1
        }
        o[w.selectedOption].focus()
    }, b.getDropdownElement = function () {
        return w.dropdownMenu
    }, b.focusToggleElement = function () {
        w.toggleElement && w.toggleElement[0].focus()
    }, b.$watch("isOpen", function (o, t) {
        if (m && w.dropdownMenu) {
            var i = s.positionElements(n, w.dropdownMenu, "bottom-left", !0), d = {
                top: i.top + "px",
                display: o ? "block" : "none"
            }, p = w.dropdownMenu.hasClass("dropdown-menu-right");
            p ? (d.left = "auto", d.right = window.innerWidth - (i.left + n.prop("offsetWidth")) + "px") : (d.left = i.left + "px", d.right = "auto"), w.dropdownMenu.css(d)
        }
        if (l[o ? "addClass" : "removeClass"](n, h).then(function () {
                angular.isDefined(o) && o !== t && v(e, {open: !!o})
            }), o)w.dropdownMenuTemplateUrl && a(w.dropdownMenuTemplateUrl).then(function (e) {
            f = b.$new(), u(e.trim())(f, function (e) {
                var n = e;
                w.dropdownMenu.replaceWith(n), w.dropdownMenu = n
            })
        }), b.focusToggleElement(), r.open(b); else {
            if (w.dropdownMenuTemplateUrl) {
                f && f.$destroy();
                var c = angular.element('<ul class="dropdown-menu"></ul>');
                w.dropdownMenu.replaceWith(c), w.dropdownMenu = c
            }
            r.close(b), w.selectedOption = null
        }
        angular.isFunction($) && $(e, o)
    }), e.$on("$locationChangeSuccess", function () {
        "disabled" !== b.getAutoClose() && (b.isOpen = !1)
    });
    var O = e.$on("$destroy", function () {
        b.$destroy()
    });
    b.$on("$destroy", O)
}]).directive("dropdown", ["$log", "$dropdownSuppressWarning", function (e, n) {
    return {
        controller: "DropdownController", link: function (o, t, i, r) {
            n || e.warn("dropdown is now deprecated. Use uib-dropdown instead."), r.init()
        }
    }
}]).directive("dropdownMenu", ["$log", "$dropdownSuppressWarning", function (e, n) {
    return {
        restrict: "AC", require: "?^dropdown", link: function (o, t, i, r) {
            if (r && !angular.isDefined(i.dropdownNested)) {
                n || e.warn("dropdown-menu is now deprecated. Use uib-dropdown-menu instead."), t.addClass("dropdown-menu");
                var l = i.templateUrl;
                l && (r.dropdownMenuTemplateUrl = l), r.dropdownMenu || (r.dropdownMenu = t)
            }
        }
    }
}]).directive("keyboardNav", ["$log", "$dropdownSuppressWarning", function (e, n) {
    return {
        restrict: "A", require: "?^dropdown", link: function (o, t, i, r) {
            n || e.warn("keyboard-nav is now deprecated. Use uib-keyboard-nav instead."), t.bind("keydown", function (e) {
                if (-1 !== [38, 40].indexOf(e.which)) {
                    e.preventDefault(), e.stopPropagation();
                    var n = r.dropdownMenu.find("a");
                    switch (e.which) {
                        case 40:
                            r.selectedOption = angular.isNumber(r.selectedOption) ? r.selectedOption === n.length - 1 ? r.selectedOption : r.selectedOption + 1 : 0;
                            break;
                        case 38:
                            r.selectedOption = angular.isNumber(r.selectedOption) ? 0 === r.selectedOption ? 0 : r.selectedOption - 1 : n.length - 1
                    }
                    n[r.selectedOption].focus()
                }
            })
        }
    }
}]).directive("dropdownToggle", ["$log", "$dropdownSuppressWarning", function (e, n) {
    return {
        require: "?^dropdown", link: function (o, t, i, r) {
            if (n || e.warn("dropdown-toggle is now deprecated. Use uib-dropdown-toggle instead."), r) {
                t.addClass("dropdown-toggle"), r.toggleElement = t;
                var l = function (e) {
                    e.preventDefault(), t.hasClass("disabled") || i.disabled || o.$apply(function () {
                        r.toggle()
                    })
                };
                t.bind("click", l), t.attr({
                    "aria-haspopup": !0,
                    "aria-expanded": !1
                }), o.$watch(r.isOpen, function (e) {
                    t.attr("aria-expanded", !!e)
                }), o.$on("$destroy", function () {
                    t.unbind("click", l)
                })
            }
        }
    }
}]), angular.module("ui.bootstrap.position", []).factory("$uibPosition", ["$document", "$window", function (e, n) {
    function o(e, o) {
        return e.currentStyle ? e.currentStyle[o] : n.getComputedStyle ? n.getComputedStyle(e)[o] : e.style[o]
    }

    function t(e) {
        return "static" === (o(e, "position") || "static")
    }

    var i = function (n) {
        for (var o = e[0], i = n.offsetParent || o; i && i !== o && t(i);)i = i.offsetParent;
        return i || o
    };
    return {
        position: function (n) {
            var o = this.offset(n), t = {top: 0, left: 0}, r = i(n[0]);
            r != e[0] && (t = this.offset(angular.element(r)), t.top += r.clientTop - r.scrollTop, t.left += r.clientLeft - r.scrollLeft);
            var l = n[0].getBoundingClientRect();
            return {
                width: l.width || n.prop("offsetWidth"),
                height: l.height || n.prop("offsetHeight"),
                top: o.top - t.top,
                left: o.left - t.left
            }
        }, offset: function (o) {
            var t = o[0].getBoundingClientRect();
            return {
                width: t.width || o.prop("offsetWidth"),
                height: t.height || o.prop("offsetHeight"),
                top: t.top + (n.pageYOffset || e[0].documentElement.scrollTop),
                left: t.left + (n.pageXOffset || e[0].documentElement.scrollLeft)
            }
        }, positionElements: function (e, n, o, t) {
            var i, r, l, s, d = o.split("-"), u = d[0], a = d[1] || "center";
            i = t ? this.offset(e) : this.position(e), r = n.prop("offsetWidth"), l = n.prop("offsetHeight");
            var p = {
                center: function () {
                    return i.left + i.width / 2 - r / 2
                }, left: function () {
                    return i.left
                }, right: function () {
                    return i.left + i.width
                }
            }, c = {
                center: function () {
                    return i.top + i.height / 2 - l / 2
                }, top: function () {
                    return i.top
                }, bottom: function () {
                    return i.top + i.height
                }
            };
            switch (u) {
                case"right":
                    s = {top: c[a](), left: p[u]()};
                    break;
                case"left":
                    s = {top: c[a](), left: i.left - r};
                    break;
                case"bottom":
                    s = {top: c[u](), left: p[a]()};
                    break;
                default:
                    s = {top: i.top - l, left: p[a]()}
            }
            return s
        }
    }
}]), angular.module("ui.bootstrap.position").value("$positionSuppressWarning", !1).service("$position", ["$log", "$positionSuppressWarning", "$uibPosition", function (e, n, o) {
    n || e.warn("$position is now deprecated. Use $uibPosition instead."), angular.extend(this, o)
}]), angular.module("ui.bootstrap.buttons", []).constant("uibButtonConfig", {
    activeClass: "active",
    toggleEvent: "click"
}).controller("UibButtonsController", ["uibButtonConfig", function (e) {
    this.activeClass = e.activeClass || "active", this.toggleEvent = e.toggleEvent || "click"
}]).directive("uibBtnRadio", function () {
    return {
        require: ["uibBtnRadio", "ngModel"],
        controller: "UibButtonsController",
        controllerAs: "buttons",
        link: function (e, n, o, t) {
            var i = t[0], r = t[1];
            n.find("input").css({display: "none"}), r.$render = function () {
                n.toggleClass(i.activeClass, angular.equals(r.$modelValue, e.$eval(o.uibBtnRadio)))
            }, n.on(i.toggleEvent, function () {
                if (!o.disabled) {
                    var t = n.hasClass(i.activeClass);
                    (!t || angular.isDefined(o.uncheckable)) && e.$apply(function () {
                        r.$setViewValue(t ? null : e.$eval(o.uibBtnRadio)), r.$render()
                    })
                }
            })
        }
    }
}).directive("uibBtnCheckbox", function () {
    return {
        require: ["uibBtnCheckbox", "ngModel"],
        controller: "UibButtonsController",
        controllerAs: "button",
        link: function (e, n, o, t) {
            function i() {
                return l(o.btnCheckboxTrue, !0)
            }

            function r() {
                return l(o.btnCheckboxFalse, !1)
            }

            function l(n, o) {
                return angular.isDefined(n) ? e.$eval(n) : o
            }

            var s = t[0], d = t[1];
            n.find("input").css({display: "none"}), d.$render = function () {
                n.toggleClass(s.activeClass, angular.equals(d.$modelValue, i()))
            }, n.on(s.toggleEvent, function () {
                o.disabled || e.$apply(function () {
                    d.$setViewValue(n.hasClass(s.activeClass) ? r() : i()), d.$render()
                })
            })
        }
    }
}), angular.module("ui.bootstrap.buttons").value("$buttonsSuppressWarning", !1).controller("ButtonsController", ["$controller", "$log", "$buttonsSuppressWarning", function (e, n, o) {
    o || n.warn("ButtonsController is now deprecated. Use UibButtonsController instead."), angular.extend(this, e("UibButtonsController"))
}]).directive("btnRadio", ["$log", "$buttonsSuppressWarning", function (e, n) {
    return {
        require: ["btnRadio", "ngModel"],
        controller: "ButtonsController",
        controllerAs: "buttons",
        link: function (o, t, i, r) {
            n || e.warn("btn-radio is now deprecated. Use uib-btn-radio instead.");
            var l = r[0], s = r[1];
            t.find("input").css({display: "none"}), s.$render = function () {
                t.toggleClass(l.activeClass, angular.equals(s.$modelValue, o.$eval(i.btnRadio)))
            }, t.bind(l.toggleEvent, function () {
                if (!i.disabled) {
                    var e = t.hasClass(l.activeClass);
                    (!e || angular.isDefined(i.uncheckable)) && o.$apply(function () {
                        s.$setViewValue(e ? null : o.$eval(i.btnRadio)), s.$render()
                    })
                }
            })
        }
    }
}]).directive("btnCheckbox", ["$document", "$log", "$buttonsSuppressWarning", function (e, n, o) {
    return {
        require: ["btnCheckbox", "ngModel"],
        controller: "ButtonsController",
        controllerAs: "button",
        link: function (t, i, r, l) {
            function s() {
                return u(r.btnCheckboxTrue, !0)
            }

            function d() {
                return u(r.btnCheckboxFalse, !1)
            }

            function u(e, n) {
                var o = t.$eval(e);
                return angular.isDefined(o) ? o : n
            }

            o || n.warn("btn-checkbox is now deprecated. Use uib-btn-checkbox instead.");
            var a = l[0], p = l[1];
            i.find("input").css({display: "none"}), p.$render = function () {
                i.toggleClass(a.activeClass, angular.equals(p.$modelValue, s()))
            }, i.bind(a.toggleEvent, function () {
                r.disabled || t.$apply(function () {
                    p.$setViewValue(i.hasClass(a.activeClass) ? d() : s()), p.$render()
                })
            }), i.on("keypress", function (n) {
                r.disabled || 32 !== n.which || e[0].activeElement !== i[0] || t.$apply(function () {
                    p.$setViewValue(i.hasClass(a.activeClass) ? d() : s()), p.$render()
                })
            })
        }
    }
}]);