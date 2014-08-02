/*

* 滑动焦点图 (淡入淡出效果) 

* 注意：图片的定位必须是absolute（因此父容器必须有relative属性）

* 约定： JQFocusImage(config)

 var config = {
    imgPosition:[string],           //图片显示位置的容器选择器，必须传入
    imgPaths:[Array],               //传入的图片路径，必须传入
    width:[number],                 //效果占用的宽高（也是图片的宽高），必须传入
    height:[number],                
    isAutoScroll:[boolean]          //是否自动轮播，必须传入
    [,links]:[Array]                //图片的链接，可选
    [,btnSelector]:[string]         //按钮选择器，可选
    [,btnSeletedClass]:[string]     //按钮选中样式，可选
    [,btnSelctectingClass]:[string] //按钮非选中样式，可选
    [,target]:[string]              //图片链接的目标，可选
 }
 
 * 最后更新 20120803(YDJ)

*/


/*+++++++++++++++ 辅助方法 ++++++++++++++*/
String.prototype.Format = function() {
    var arg = arguments;
    if (arg.length < 1) { return this; }
    return this.replace(/\$(\d*)/igm, function(ma) {
        try {
            return arg[parseInt(ma.replace(/\$/igm, ""))];
        } catch (ex) {
            return ma;
        }
    });
}

/*+++++++++++++++ 效果1： jQuery 焦点切换图 ++++++++++++++*/
function JQFocusImage(config) {
    this.v_ImgContainer = config.imgPosition;
    this.v_ImgPaths = config.imgPaths;
    this.v_Width = config.width;
    this.v_Height = config.height;

    this.v_IsAutoScroll = config.isAutoScroll;
    this.v_Links = config.links || null;
    this.v_LinkTag = config.target || "_blank";
    this.v_BtnSelector = config.btnSelector || null;
    this.v_BtnSelectedClass = config.btnSeletedClass || "JQFI_BTN_SELECTED";
    this.v_BtnSelectingClass = config.btnSelctectingClass || "JQFI_BTN_SELECTING";

    this.v_EffectTime = 800;
    this.v_Interval = null;
    this.v_DelayTime = 3000;
    this.v_SelectedTag = "FOCUSSELECTED";
    this.v_ImgSeqTag = "IMGSEQ";
    this.v_FocusWrapper = "FOCUSIMGCONTAINER";
}

JQFocusImage.prototype.Show = function() {
    this.CheckArguments();
    this.LoadImgsAndLinks();
    this.LoadButtons();
    this.AutoScroll();
};

JQFocusImage.prototype.CheckArguments = function() {
    if (typeof this.v_ImgContainer !== "string" || this.v_ImgContainer == "")
        throw new Error("必须参数v_ImgContainer为空或不是字符串");
    if (false === this.v_ImgPaths instanceof Array || this.v_ImgPaths.length <= 0)
        throw new Error("必须参数v_ImgPaths无值或不是一个数组");
    if (typeof this.v_Width !== "number" || this.v_Width <= 0)
        throw new Error("必须参数v_Width为0或不是一个数值");
    if (typeof this.v_Height !== "number" || this.v_Height <= 0)
        throw new Error("必须参数v_Height为0或不是一个数值");
    if (typeof this.v_IsAutoScroll !== 'boolean')
        throw new Error("必须参数v_IsAutoScroll不是一个布尔值");
};

/*++++++++++++++++++ 图片和链接 ++++++++++++++++++++++*/
JQFocusImage.prototype.LoadImgsAndLinks = function() {
    var linksHTML = this.CreateLinks();
    var imgsHTML = this.CreateImgs();

    var strHTML = "<div id='$0' style='display:block;position:relative;width:$1;height:$2;'>".Format(this.v_FocusWrapper, this.v_Width, this.v_Height);
    strHTML += linksHTML + imgsHTML + "</div>";
    $(this.v_ImgContainer).html(strHTML);

    if (linksHTML) { //有链接
        $("#" + this.v_FocusWrapper + " img").each(function(ind) {
            $(this).appendTo($(this).siblings("a").eq(ind));
        });
    }
    var _self = this;
    $("#" + this.v_FocusWrapper).children().each(function(ind) {
        $(this).css({ display: "none", position: "absolute" }).attr(_self.v_ImgSeqTag, ind);
        if (ind == 0) $(this).attr(_self.v_SelectedTag, true).css("display", "block");
    });
};
JQFocusImage.prototype.CreateLinks = function() {
    if (false == this.v_Links instanceof Array || this.v_Links.length !== this.v_ImgPaths.length)
        return "";
    var strHTML = "";
    for (var i = 0, len = this.v_Links.length; i < len; i++) {
        strHTML += "<a href='$0' style='width:$1px;height:$2px;' target='$3'></a>".Format(this.v_Links[i], this.v_Width, this.v_Height, this.v_LinkTag);
    };
    return strHTML;
};
JQFocusImage.prototype.CreateImgs = function() {
    var strHTML = "";
    for (var i = 0, len = this.v_ImgPaths.length; i < len; i++) {
        strHTML += "<img src='$2' style='width:$0px;height:$1px;border:0 none;top:0;left:0;'/>".Format(this.v_Width, this.v_Height, this.v_ImgPaths[i]);
    }
    return strHTML;
};

/*++++++++++++++++++ 按 钮 ++++++++++++++++++++++*/
JQFocusImage.prototype.LoadButtons = function() {
    if (this.v_BtnSelector == null || $(this.v_BtnSelector).length !== $(this.v_ImgPaths).length)
        return;

    if (this.v_IsAutoScroll) {
        $(this.v_BtnSelector)
        .hover(function() { //鼠标移入，停止自动
            if (_self.v_Interval) {
                window.clearInterval(_self.v_Interval);
                _self.v_Interval = null;
            }
        }, function() { //鼠标移出，开始自动
            _self.AutoScroll();
        });
    }

    var _self = this;
    $(this.v_BtnSelector)
	.eq(0).removeClass(this.v_BtnSelectingClass).addClass(this.v_BtnSelectedClass).attr(this.v_SelectedTag, "true")
	.siblings().removeClass(this.v_BtnSelectedClass).addClass(this.v_BtnSelectingClass);
    this.BindButtonsClickEvent();
};

JQFocusImage.prototype.BindButtonsClickEvent = function () {
    var _self = this;
    $(_self.v_BtnSelector).click(function () {
        var showingIndex = $(this).index(_self.v_BtnSelector);
        var hidingIndex = $(_self.v_BtnSelector + "[" + _self.v_SelectedTag + "]").index(_self.v_BtnSelector);
        //正在显示这个按钮点击的这张图
        if (showingIndex == hidingIndex) return;

        _self.Play(showingIndex);
    });
};

JQFocusImage.prototype.AutoScroll = function() {
    if (!this.v_IsAutoScroll)
        return;
        
    if (this.v_Interval) {
        window.clearInterval(this.v_Interval);
        this.v_Interval = null;
    }
    var _self = this;
    this.v_Interval = window.setInterval(function() {
        _self.Play.call(_self);
    }, this.v_DelayTime);
};
/*++++++++++++++++++ 效果核心代码 ++++++++++++++++++++++*/
JQFocusImage.prototype.Play = function(showSeq) {
    var num = this.v_ImgPaths.length;

    var hidingSeq = $("#" + this.v_FocusWrapper + " [" + this.v_SelectedTag + "]").attr(this.v_ImgSeqTag);
    var showingSeq = showSeq; //将要显示的图片是参数指定的还是下一张
    if (typeof showingSeq !== 'number') showingSeq = (parseInt(hidingSeq) + 1 >= num ? 0 : parseInt(hidingSeq) + 1);


    var $showingDom = $("#" + this.v_FocusWrapper + " [" + this.v_ImgSeqTag + "='" + showingSeq + "']");
    var $hidingDom = $("#" + this.v_FocusWrapper + " [" + this.v_ImgSeqTag + "='" + hidingSeq + "']");

    if ($showingDom.is(":animated") || $hidingDom.is(":animated")) return false;

    $hidingDom.removeAttr(this.v_SelectedTag);
    $showingDom.attr(this.v_SelectedTag, true);

    $showingDom.before($hidingDom);
    $showingDom.fadeIn(this.v_EffectTime);
    $hidingDom.fadeOut(this.v_EffectTime);

    this.SwitchButton(showingSeq);
    return true;
};


JQFocusImage.prototype.SwitchButton = function(showingInd) {
    //隐藏哪个我知道
    $(this.v_BtnSelector + "[" + this.v_SelectedTag + "]")
        .removeClass(this.v_BtnSelectedClass).addClass(this.v_BtnSelectingClass).removeAttr(this.v_SelectedTag);
    //显示哪一个(参数传入)？
    $(this.v_BtnSelector).eq(showingInd)
        .removeClass(this.v_BtnSelectingClass).addClass(this.v_BtnSelectedClass).attr(this.v_SelectedTag, true);
};
//---------------------------------------------------------------------------------------------------------------
