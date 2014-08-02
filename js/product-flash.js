
/* ========================
 * 首页，产品的滑动效果
 * 2013-03-21
 * yangdejian
 * ========================*/

function moveDown(element) {
    var tagetElement = $(element).find(effectElement)[0];
    if (tagetElement) {
        var h = $.getHeight(tagetElement);
        var t = $.getTop(tagetElement);
        if (h <= 50) {
            $.completeMovingDown(element);
            return;
        }
        $(tagetElement).css({ top: t + 5 + 'px', height: h - 5 + 'px' });
        var self = arguments.callee;
        var data = $.getStation(element);
        data.timeout = window.setTimeout(function () {
            self.call(window, element);
        }, 40);
    }
}
function moveUp(element) {
    var tagetElement = $(element).find(effectElement)[0];
    if (tagetElement) {
        var h = $.getHeight(tagetElement);
        var t = $.getTop(tagetElement);
        if (h >= 145) {
            $.completeMovingUp(element);
            return;
        }
        $(tagetElement).css({ top: t - 5 + 'px', height: h + 5 + 'px' });
        var self = arguments.callee;
        var data = $.getStation(element);
        data.timeout = window.setTimeout(function () {
            self.call(window, element);
        }, 40);
    }
}

(function ($) {
    $.extend($.fn, {
        slideDown: function () { // 下滑
            $(this).each(function () {
                var element = this;
                if ($.isMovingDown(element)) { // 正在下移
                    return;
                } else if ($.isMovingUp(element)) { // 正在上移, 终止上移，并开始下移 
                    $.clearTimeout(element);
                    $.prepareMovingDown(element);
                    moveDown(element);
                } else if ($.isMovingUpComplete(element)) { // 上移已经结束，准备并下移
                    $.prepareMovingDown(element); // 准备下移
                    moveDown(element);
                }
            });
        },
        slideUp: function () { // 上滑 
            var element = this[0];
            if ($.isMovingUp(element)) { // 正在上移
                return;
            } else if ($.isMovingDown(element)) { // 正在下移，终止下移，并开始上移
                $.clearTimeout(element);
                $.prepareMovingUp(element);
                moveUp(element);
            } else if ($.isWaitMoving(element) || $.isMovingDownComplete(element)) { // 下移已经结束或者正在等待移动
                $.prepareMovingUp(element);
                moveUp(element);
            }
        }
    });

    $.clearTimeout = function (element) {
        var status = $.getStation(element);
        status.clearTimeout();
    };
    $.isMovingDownComplete = function (element) {
        var status = $.getStation(element);
        return (status.action == Action.down && status.step == Step.complete);
    };
    $.isMovingUpComplete = function (element) {
        var status = $.getStation(element);
        return (status.action == Action.up && status.step == Step.complete);
    };

    $.isWaitMoving = function (element) {
        var status = $.getStation(element);
        return (status.action == Action.wait && status.step == Step.wait);
    };

    $.completeMovingUp = function (element) {
        var status = $.getStation(element);
        status.action = Action.up;
        status.step = Step.complete;
        status.clearTimeout();
    };

    $.completeMovingDown = function (element) {
        var status = $.getStation(element);
        status.action = Action.down;
        status.step = Step.complete;
        status.clearTimeout();
    };

    $.prepareMovingDown = function (element) {
        var status = $.getStation(element);
        status.action = Action.down;
        status.step = Step.playing;
    };

    $.prepareMovingUp = function (element) {
        var status = $.getStation(element);
        status.action = Action.up;
        status.step = Step.playing;
    };

    $.isMovingDown = function (element) {
        var status = $.getStation(element);
        return (status.action == Action.down && status.step == Step.playing);
    };

    $.isMovingUp = function (element) {
        var status = $.getStation(element);
        return (status.action == Action.up && status.step == Step.playing);
    };

    $.getStation = function (element) {
        var data = $.data(element, cacheData);
        if (!data) {
            data = new slider();
            $.data(element, cacheData, data);
        }
        return data;
    };

    $.getHeight = function (element) {
        try {
            return parseInt(element.style.height) || $(element).height();
        } catch (_e) {
            return $(element).height();
        }
    };

    $.getTop = function (element) {
        try {
            return parseInt(element.style.top) || $(element).position().top;
        } catch (_e) {
            return $(element).position().top;
        }
    };

})(jQuery);

function slider() {
    this.action = 'wait'; // wait/up/down
    this.step = 'wait'; // wait/playing/complete
    this.timeout = null;

    this.clearTimeout = function () {
        if (this.timeout) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }
    };
}
var Action = { wait: 'wait', up: 'up', down: 'down' };
var Step = { wait: 'wait', playing: 'playing', complete: 'complete' };