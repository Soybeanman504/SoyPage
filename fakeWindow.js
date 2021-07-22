window.onload = function () {
    new fakeWindow(20, 100, 500, 300, 'title');
}

class fakeWindow {
    constructor(x, y, w, h, path) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.path = path;//表示する相対パス

        this.minX = 0;//座標と大きさの範囲
        this.minY = 0;
        this.minW = 400;
        this.minH = 300;
        this.moveRightRange();//max(x,y,w,h)を設定
        this.moveBottomRange();

        this.tempX = x;//ウインドウ操作中に使われる座標と大きさ。範囲制限がない。
        this.tempY = y;
        this.tempW = w;
        this.tempH = h;

        this.divParent = null;//親要素
        this.divNames = [//this.('div' + divName)でそのdiv要素を指す。
            'Main',
            'Bar',
            'Handle',
            'Back',
            'Next',
            'Close',
            'TopLeft',
            'Top',
            'TopRight',
            'Left',
            'Right',
            'BottomLeft',
            'Bottom',
            'BottomRight'
        ];
        this.divHideBarNames = [//隠れた要素[y,x]
            ['TopLeft', 'Top', 'TopRight'],
            ['Left', '', 'Right'],
            ['BottomLeft', 'Bottom', 'BottomRight']
        ];
        this.iframe = null;//ウィンドウ内のiframe

        this.windowMax = 5;//ウィンドウ最大数
        this.title = '';//ウインドウのタイトル(元のよりTITLEタグを有線)
        this.pointerNow = { x: null, y: null };//今のポインターの位置を記憶
        this.pointerOld = { x: null, y: null };//昔のポインターの位置を記憶
        this.divNames.forEach((pointerName) => {//ポインターの有無
            this['pointer' + pointerName] = null;
        });

        var $body = $('body');

        for (var i = 0; i < this.windowMax; i++) {
            if (!$body.find('#this' + i)[0]) {
                break;
            }
        }

        if (i < this.windowMax) {
            this.makeWindow(i);
        }
    }

    makeWindow(n) {
        /*
        var divParent = document.createElement('div');
        divParent.class='this';
        document.body.appendChild(divParent);
        */
        var $divParent = $('<div class="fakeWindow" id="fakeWindow' + n + '"/>');

        $('body').append($divParent);

        $divParent.load('./fakeWindow.html', () => {
            this.divParent = $('#fakeWindow' + n)[0];//Domオブジェクトに変換
            this.setWindow();
        });
    }

    setWindow() {
        this.divNames.forEach((divName) => {
            this['div' + divName] = this.divParent.getElementsByClassName('fake' + divName)[0];
        });

        this.iframe = this.divMain.getElementsByClassName('fakePage')[0];

        if (this.iframe.getElementsByTagName('title')[0]) {
            this.title = this.iframe.getElementsByTagName('title')[0].innerText;
        }

        this.setX(this.x);
        this.setY(this.y);
        this.setWidth(this.w);
        this.setHeight(this.h);

        this.divNames.forEach((divName) => {
            if (typeof (this['event' + divName]) == 'function') {
                this['event' + divName]();
            }
        });
        /*//無理だった
                for (let divX = 0; divX < 3; divX++) {
                    for (let divY = 0; divY < 3; divY++) {
                        let divHideBarName = this.divHideBarNames[divY][divX];
                        if (divHideBarName == '') {
        
                        } else {
                            let divHideBar = this['div' + divHideBarName];
                            let x = divX - 1;
                            let y = divY - 1;
                            let func;
        
                            this.eventPointer(divHideBarName);
        
                            if (x == -1) {
                                func = (event) => { this.moveLeftRange(); }
                            } else if (x == 1) {
                                func = (event) => { this.moveRightRange(); }
                            }
        
                            if (y == -1) {
                                func = joinEventFunctions(func, (event) => { this.moveTopRange(); });
                            } else if (y == 1) {
                                func = joinEventFunctions(func, (event) => { this.moveBottomRange(); });
                            }
        
                            console.log(divHideBarName, divHideBar, func);
                            addEventsMouseAndTouch(divHideBar, 'start', func);
        
                            func = (event) => {
                                this.pointerNow = getMouseAndTouchPointer(event);
                            }
        
                            if (x == -1) {
                                func = joinEventFunctions(func, (event) => {
                                    this.moveX();
                                    this.shiftWidth(-1);
                                });
                            } else if (x == 1) {
                                func = joinEventFunctions(func, (event) => {
                                    this.moveX();
                                    this.shiftWidth(1);
                                });
                            }
        
                            if (y == -1) {
                                func = joinEventFunctions(func, (event) => {
                                    this.moveY();
                                    this.shiftHeight(-1);
                                });
                            } else if (y == 1) {
                                func = joinEventFunctions(func, (event) => {
                                    this.moveY();
                                    this.shiftHeight(1);
                                });
                            }
        
                            var func1 = joinEventFunctions(func, (event) => {
                                this.pointerOld = this.pointerNow;
                            });
        
                            func = (event) => {
                                if(divHideBar){
                                    func1;
                                }
                            }
                        }
                    }
                }
        */
        addEventsMouseAndTouch($('body')[0], 'end', (event) => {
            this.moveRightRange();
            this.moveBottomRange();

            this.tempX = this.x;
            this.tempY = this.y;
            this.tempW = this.w;
            this.tempH = this.h;
        });

        this.eventIframe();
    }

    eventParent() {
        addEventsMouseAndTouch(this.divParent, 'start', (event) => {

        });
    }

    eventBar() {

    }

    eventHandle() {
        this.eventPointer('Handle');

        addEventsMouseAndTouch($('body')[0], 'move', (event) => {
            if (this.pointerHandle) {
                this.pointerNow = getMouseAndTouchPointer(event);
                this.moveX();
                this.moveY();
                this.pointerOld = this.pointerNow;
            }
        });
    }

    eventClose() {
        addEventsMouseAndTouch(this.divClose, 'click', (event) => {
            this.divParent.remove();
            delete this;
        });
    }

    eventIframe() {
        addEventsMouseAndTouch($('body')[0], 'start', (event) => {
            this.iframe.style['z-index'] = -1;
        });

        addEventsMouseAndTouch($('body')[0], 'end', (event) => {
            this.iframe.style['z-index'] = 1;
        });
    }

    eventPointer(locationName) {
        addEventsMouseAndTouch(this['div' + locationName], 'start', (event) => {
            this['pointer' + locationName] = true;
            this.pointerOld = getMouseAndTouchPointer(event);
        });

        addEventsMouseAndTouch($('body')[0], 'end', (event) => {
            this['pointer' + locationName] = false;
        });
    }

    eventTopLeft() {
        this.eventPointer('TopLeft');

        addEventsMouseAndTouch(this.divTopLeft, 'start', (event) => {
            this.moveLeftRange();
            this.moveTopRange();
        });

        addEventsMouseAndTouch($('body')[0], 'move', (event) => {
            if (this.pointerTopLeft) {
                this.pointerNow = getMouseAndTouchPointer(event);
                this.moveX();
                this.moveY();
                this.shiftWidth(-1);
                this.shiftHeight(-1);
                this.pointerOld = this.pointerNow;
            }
        });
    }

    eventTop() {
        this.eventPointer('Top');

        addEventsMouseAndTouch(this.divTop, 'start', (event) => {
            this.moveTopRange();
        });

        addEventsMouseAndTouch($('body')[0], 'move', (event) => {
            if (this.pointerTop) {
                this.pointerNow = getMouseAndTouchPointer(event);
                this.moveY();
                this.shiftHeight(-1);
                this.pointerOld = this.pointerNow;
            }
        });
    }

    eventTopRight() {
        this.eventPointer('TopRight');

        addEventsMouseAndTouch(this.divTopRight, 'start', (event) => {
            this.moveTopRange();
        });

        addEventsMouseAndTouch($('body')[0], 'move', (event) => {
            if (this.pointerTopRight) {
                this.pointerNow = getMouseAndTouchPointer(event);
                this.moveY();
                this.shiftWidth(1);
                this.shiftHeight(-1);
                this.pointerOld = this.pointerNow;
            }
        });
    }

    eventLeft() {
        this.eventPointer('Left');

        addEventsMouseAndTouch(this.divLeft, 'start', (event) => {
            this.moveLeftRange();
        });

        addEventsMouseAndTouch($('body')[0], 'move', (event) => {
            if (this.pointerLeft) {
                this.pointerNow = getMouseAndTouchPointer(event);
                this.moveX();
                this.shiftWidth(-1);
                this.pointerOld = this.pointerNow;
            }
        });
    }

    eventRight() {
        this.eventPointer('Right');

        addEventsMouseAndTouch($('body')[0], 'move', (event) => {
            if (this.pointerRight) {
                this.pointerNow = getMouseAndTouchPointer(event);
                this.shiftWidth(1);
                this.pointerOld = this.pointerNow;
            }
        });
    }

    eventBottomLeft() {
        this.eventPointer('BottomLeft');

        addEventsMouseAndTouch(this.divBottomLeft, 'start', (event) => {
            this.moveLeftRange();
        });

        addEventsMouseAndTouch($('body')[0], 'move', (event) => {
            if (this.pointerBottomLeft) {
                this.pointerNow = getMouseAndTouchPointer(event);
                this.moveX();
                this.shiftWidth(-1);
                this.shiftHeight(1);
                this.pointerOld = this.pointerNow;
            }
        });
    }


    eventBottom() {
        this.eventPointer('Bottom');

        addEventsMouseAndTouch($('body')[0], 'move', (event) => {
            if (this.pointerBottom) {
                this.pointerNow = getMouseAndTouchPointer(event);
                this.shiftHeight(1);
                this.pointerOld = this.pointerNow;
            }
        });
    }

    eventBottomRight() {
        this.eventPointer('BottomRight');

        addEventsMouseAndTouch($('body')[0], 'move', (event) => {
            if (this.pointerBottomRight) {
                this.pointerNow = getMouseAndTouchPointer(event);
                this.shiftWidth(1);
                this.shiftHeight(1);
                this.pointerOld = this.pointerNow;
            }
        });
    }

    moveX() {
        this.tempX += this.pointerNow.x - this.pointerOld.x;
        this.setX(this.tempX);
    }

    moveY() {
        this.tempY += this.pointerNow.y - this.pointerOld.y;
        this.setY(this.tempY);
    }

    shiftWidth(sign) {
        if (sign == 1) {
            this.tempW += this.pointerNow.x - this.pointerOld.x;
        } else if (sign == -1) {
            this.tempW -= this.pointerNow.x - this.pointerOld.x;
        }
        this.setWidth(this.tempW);
    }

    shiftHeight(sign) {
        if (sign == 1) {
            this.tempH += this.pointerNow.y - this.pointerOld.y;
        } else if (sign == -1) {
            this.tempH -= this.pointerNow.y - this.pointerOld.y;
        }
        this.setHeight(this.tempH);
    }

    moveLeftRange() {
        this.maxX = this.x + this.w - this.minW;
        this.maxW = this.x + this.w;
    }

    moveTopRange() {
        this.maxY = this.y + this.h - this.minH;
        this.maxH = this.y + this.h;
    }

    moveRightRange() {
        var bodyRange = $('body')[0].getBoundingClientRect();
        this.maxX = bodyRange.width - this.w;
        this.maxW = bodyRange.width - this.x;
    }

    moveBottomRange() {
        var bodyRange = $('body')[0].getBoundingClientRect();
        this.maxY = bodyRange.height - this.h;
        this.maxH = bodyRange.height - this.y;
    }

    setX(x) {
        this.x = valueRange(x, this.minX, this.maxX);
        this.divParent.style.left = this.x + 'px';
    }

    setY(y) {
        this.y = valueRange(y, this.minY, this.maxY);
        this.divParent.style.top = this.y + 'px';
    }

    setWidth(w) {
        this.w = valueRange(w, this.minW, this.maxW);
        this.divParent.style.width = this.w + 'px';
    }

    setHeight(h) {
        this.h = valueRange(h, this.minH, this.maxH);
        this.divParent.style.height = this.h + 'px';
    }
}
/*//無理だった
function joinEventFunctions(function1, function2) {
    console.log(function1,function2);{
    let list = [function1,function2];
    var function3 = (event) => {
        list.function1 (event);
        list.function2 (event);
    }
    }
    console.log(function3);
    return function3;
}
*/
function addEventsMouseAndTouch(element, eventName, listener) {
    var eventLists = {
        'click': ['click', 'touchend'],
        'start': ['mousedown', 'touchstart'],
        'move': ['mousemove', 'touchmove'],
        'end': ['mouseup', 'touchend', 'touchcancel'],
        'over': ['mouseover']
    };
    var eventList = eventLists[eventName];

    eventList.forEach((eventName) => {
        element.addEventListener(eventName, (event) => {
            listener(event);
        });
    });
}

function getMouseAndTouchPointer(event) {
    var x = 0, y = 0;

    if (event.touches && event.touches[0]) {
        x = event.touches[0].pageX;
        y = event.touches[0].pageY;
    } else if (event.originalEvent && event.originalEvent.changedTouches[0]) {
        x = event.originalEvent.changedTouches[0].pageX;
        y = event.originalEvent.changedTouches[0].pageY;
    } else {
        if (event.pageX) {
            x = event.pageX;
        }
        if (event.pageY) {
            y = event.pageY;
        }
    }

    return { x: x, y: y };
}

function valueRange(value, min, max) {
    return Math.max(min, Math.min(max, value));
}