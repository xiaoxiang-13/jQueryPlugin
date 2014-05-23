/**
 * 城市输入框sug
 */

//city sug 命名空间
var CSUG = {
    //当前正在操作的对象，obj=输入框，opts=配置，drop=下拉菜单
    curr : {
        obj : null,
        opts : null,
        drop : null
    },
    //请求数据
    getCity : function(val){
        $.ajax({
            type : "get",
            url : "http://www.nuomi.com/citySug",
            dataType : "jsonp",
            jsonp : "callback",
            jsonpCallback : "CSUG.cityHandler",
            data : {
                "tag" : val
            }
        });
    },
    //请求数据回调
    cityHandler : function (data){
        var _csug = CSUG,
            _curr = _csug.curr;
        _curr.drop[0] ? _csug.updateDrop(_curr.drop,data) : _csug.createDrop(_curr.obj,_curr.opts,data);
    },
    //创建城市下拉菜单
    createDrop : function (obj, opts, data){
        var html = '<div class="citySugDrop" relinput="' + obj.attr("id") + '">' + '</div>',
            pos = {
                top : obj.offset().top + obj.outerHeight() + opts.topAdjust,
                left : obj.offset().left + opts.leftAdjust
            },
            dropStyle = $.extend(pos,{
                width : opts.width
            });

        $('body').append(html);

        var currDrop = $('[relinput="' + obj.attr("id") + '"]');
        currDrop.css(dropStyle).click(function(e){
            e.stopPropagation();
        });
        CSUG.updateDrop(currDrop, data);
    },
    //更新下拉菜单
    updateDrop : function(drop,data){
        var str = '',
            ipt = $('#'+ drop.attr('relinput'));
        if( data.length > 0 ){  
            str += '<ul class="dropList">';          
            for(var i=0, len=data.length; i<len; i++ ){               
                str += '<li area="' + data[i].areaId + '" title="' + data[i].name + '">' + data[i].name + '</li>';                
            }
            str += '</ul>';
        }else{
            str = '<p class="noResult">找不到相关城市</p>';
        }
        drop.show().attr('entered','').html('').html(str);

        drop.find('li').mousedown(function(){
            ipt.blur();
        }).mouseup(function(){
            var _this = $(this),
                _csug = CSUG,
                _curr = _csug.curr;
            _this.siblings().removeClass('active');
            _this.addClass('active');
            _csug.enterData(drop);
            _curr.opts.aferEnterFn();
            drop.hide();
        });
    },
    //上下选择
    moveActive : function(d,drop,ipt){
        var hasActive = drop.find('.active')[0],
            currItem = drop.find('.active'),
            len = drop.find('li').length;
        if( d==='down' ){
            if(!hasActive || currItem.index() === (len-1) ){
                currItem.removeClass('active');
                drop.find('li').eq(0).addClass('active');
            }else{
                currItem.removeClass('active').next().addClass('active');
            }            
        }
        if( d==='up' ){
            if(!hasActive || currItem.index() === 0 ){
                currItem.removeClass('active');
                drop.find('li').eq(len-1).addClass('active');
            }else{
                currItem.removeClass('active').prev().addClass('active');
            }
        }
        if($.browser.msie){
            ipt.focus();
            $('.popCityBox:visible').hide();
        }
        CSUG.enterData(drop);
    },
    //确认选择
    enterData : function(drop){
        CSUG.curr.opts.enterFn(drop);
        drop.attr('entered','true'); 
    },
    //隐藏下拉菜单
    hideSug : function(){
        $('.citySugDrop').hide();
    }
};

/**
 * jquery插件citySug
 * 参数：
 *   topAdjust: number 位置上下微调，正数向下，负数向上
 *   leftAdjust：number  位置左右微调，正数向右，负数向左
 *   width：number 下拉列表宽度
 *   enterFn : function 数据输入处理，传进来的参数是“下拉城市列表”
 *   aferEnterFn ：数据输入成功后的追加操作  
 */
$.fn.citySug = function(options){
    var defaults = {
            topAdjust : 0,
            leftAdjust : 0,
            width : 195,
            enterFn : function(drop){
                var ipt = $('#'+ drop.attr('relinput')),
                    currItem = drop.find('.active'),
                    name = currItem.html(),
                    areaid = currItem.attr('area');
                ipt.attr('value', name).attr('origvalue', name);
                ipt.prev('[type="hidden"]').attr('value', areaid);
            },
            aferEnterFn : function(){}
        },
        opts = $.extend({},defaults,options);

    $(document).click(function(){
        $('.citySugDrop').hide();
    });

    return this.each(function(){
        $(this).bind('keyup change keydown', function(e){
            if( e.type != 'keydown' ){
                var val = $.trim($(this).val()),
                    drop = $('[relinput="' + $(this).attr("id") + '"]'),
                    ipt = $(this),
                    _csug = CSUG,
                    _curr = _csug.curr;

                if( val === '' ){
                    _csug.hideSug();
                    return;
                }    

                switch(e.keyCode){
                    case 38 : 
                        drop.show();
                        _csug.moveActive('up',drop,ipt);
                        return;
                    break;
                    case 40 :
                        drop.show();
                        _csug.moveActive('down',drop,ipt);
                        return;
                    break;
                    case 13 :
                        drop.attr('entered') === 'true' && _curr.opts.aferEnterFn();
                        return;
                    break;
                }

                _curr.obj = ipt;
                _curr.drop = drop || null;
                _curr.opts = opts;
                _csug.getCity(val); 
            }else{
               if( e.keyCode === 13 ){
                    return false;
                }
            }
        });
    });
};
