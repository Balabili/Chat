define(function () {
    var cookieHelper = {};

    cookieHelper.setCookie = function (name, value) {
        // var Days = 30;
        // var exp = new Date();
        // exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        // document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
        document.cookie = name + "=" + escape(value);
    }

    cookieHelper.getCookie = function (name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return null;
    }

    cookieHelper.delCookie = function (name) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = cookieHelper.getCookie(name);
        if (cval != null)
            document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
    }

    return {
        cookieHelper: cookieHelper
    }
});