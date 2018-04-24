let throttle = function (fn, delay) {
    let timer = null;

    return function (e) {
        clearTimeout(timer);
        timer = setTimeout(function() {
            fn(e);
        }, delay);
    }
}
class Game {
    constructor(props) {
        const that = this
        this.props = props
        this.ceils = Array.from(document.querySelectorAll('.ceil'))
        // this.NumArr = []
        // this.score = 0
        this.scoreEl = document.querySelector('#score')
        this.mostScoreEl = document.querySelector('#mostScore')
        // 注册事件
        const boxEl = document.querySelector('#box')
        let boxWidth = this.getStyle(boxEl, 'width')
        this.ceilWidth = (parseInt(boxWidth) - 40) / 4
        document.addEventListener('keyup', throttle(function (e) {
            e.preventDefault()
            switch (e.keyCode) {
                // 左移
                case 37:
                    that.moveLeft()
                    setTimeout(that.render.bind(that), 200)
                    break
                // 上移
                case 38:
                    that.moveUp()
                    setTimeout(that.render.bind(that), 200)
                    break
                // 右移
                case 39:
                    that.moveRight()
                    setTimeout(that.render.bind(that), 200)
                    break
                // 下移    
                case 40:
                    that.moveDown()
                    setTimeout(that.render.bind(that), 200)
                    break
                default: break
            }
        }, 200))
        // 移动端
        document.addEventListener("touchstart", function (event) {
            event.preventDefault()
            that.startX = event.touches[0].pageX
            that.startY = event.touches[0].pageY
        })
        document.body.addEventListener("touchmove", function (event) {
            event.preventDefault()
        })
        document.addEventListener("touchend", function (event) {
            const endX = event.changedTouches[0].pageX;
            const endY = event.changedTouches[0].pageY;

            const subtractX = endX - that.startX;
            const subtractY = endY - that.startY;

            if (Math.abs(subtractX) < 10 && Math.abs(subtractY) < 10) return;

            if (Math.abs(subtractX) >= Math.abs(subtractY)) {
                if (subtractX > 0) {
                    that.moveRight()
                    setTimeout(that.render.bind(that), 200)
                } else {
                    that.moveLeft()
                    setTimeout(that.render.bind(that), 200)
                }
            } else {
                if (subtractY > 0) {
                    that.moveDown()
                    setTimeout(that.render.bind(that), 200)
                } else {
                    that.moveUp()
                    setTimeout(that.render.bind(that), 200)
                }
            }
        });
        document.querySelector('#newgame').addEventListener('click', function (e) {
            if (confirm('确定开始新游戏？')) {
                e.preventDefault()
                that.init()
            }
        })
        this.init()
    }
    // 清空状态等等
    init() {
        this.NumArr = []
        for (let i = 0; i < 4; i++) {
            this.NumArr[i] = []
            for (let j = 0; j < 4; j++) {
                this.NumArr[i].push({
                    changed: false,
                    value: 0,
                    double: false
                })
            }
        }
        this.once = null
        this.historyScore = localStorage.getItem('mostScore')
        this.score = 0
        this.scoreEl.innerHTML = 0
        this.mostScoreEl.innerHTML = this.historyScore || 0
        this.random('init')
        this.random('init')
        this.render(this, 'init')
    }
    getStyle(el, style) {
        return (el.currentStyle ? el.currentStyle : window.getComputedStyle(el, null))[style]
    }
    render(that = this, init) {
        const OldNumArr = that.NumArr
        // 比较现有和操作后的，进行一些计算和位移动画
        const newNumArr = that.cacheNumArr
        // const compareR = that.compare(OldNumArr, newNumArr)
        // if (!compareR && !init) return

        // 根据新的渲染节点
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (OldNumArr[i][j].value === 2048) {
                    if(alert('恭喜完成挑战！')) {
                        that.init()
                        return
                    }
                }
                if (that.once === null) {
                    that.ceils[i * 4 + j].style.width = `${that.ceilWidth}px`
                    that.ceils[i * 4 + j].style.height = `${that.ceilWidth}px`
                    that.ceils[i * 4 + j].style.top = `${i * (that.ceilWidth + 8) + 4}px`
                    that.ceils[i * 4 + j].style.left = `${j * (that.ceilWidth + 8) + 4}px`
                }
                // 不一样的再更新
                // if (compareR[i][j] === 'change') {
                if (OldNumArr[i][j].value) {
                    if (OldNumArr[i][j].double) {
                        that.ceils[i * 4 + j].innerHTML = `<div class="ceil-${OldNumArr[i][j].value}" style="left: 0;top: 0;transform:scale(1.1);line-height:${that.ceilWidth}px">${OldNumArr[i][j].value}</div>`
                        this.scaleAnimation(i, j, 200)
                        that.score += OldNumArr[i][j].value
                        that.scoreEl.innerHTML = that.score
                        if (that.score > that.historyScore) {
                            localStorage.setItem('mostScore', that.score)
                            that.mostScoreEl.innerHTML = that.score
                        }
                    } else
                        that.ceils[i * 4 + j].innerHTML = `<div class="ceil-${OldNumArr[i][j].value}" style="left: 0;top: 0;transform:scale(1.0);line-height:${that.ceilWidth}px">${OldNumArr[i][j].value}</div>`
                } else {
                    that.ceils[i * 4 + j].innerHTML = ''
                }
                // }
                OldNumArr[i][j].double = false
            }
        }
        that.once = 'init'
        // 更新NumArr
        // that.NumArr = that.deepCopy(newNumArr)

        if (!init) that.random()

        if (!that.gameOver()) {
            if (localStorage.getItem('mostScore') < that.score)
                localStorage.setItem('mostScore', that.score)
            if (confirm('Game Over!')) {
                that.init()
            }


        }
    }
    random(init) {
        let ranPosArr = this.blank()
        if (!ranPosArr) return
        // 随机出现的位置坐标
        let ranPos = ranPosArr[Math.floor(Math.random() * ranPosArr.length)]
        // 随机显示的数
        let ranN = Math.random() > 0.5 ? 2 : 4
        // 返回新的NumArr 浅拷贝
        this.NumArr[ranPos[0]][ranPos[1]].value = ranN
        if (!init) {
            // this.NumArr = this.deepCopy(this.cacheNumArr)
            const i = ranPos[0], j = ranPos[1]
            this.ceils[i * 4 + j].innerHTML = `<div class="ceil-${ranN}" style="left: 0;top: 0;transform:scale(0);line-height:${this.ceilWidth}px">${ranN}</div>`
            this.scaleAnimation(i, j)
        }

    }
    moveLeft() {
        let NumArr = this.NumArr
        // 先去0, 再判断相加
        for (let i = 0; i < 4; i++) {
            let firstZero = null
            for (let j = 0; j < 4; j++) {
                if (firstZero === null && NumArr[i][j].value === 0) {
                    firstZero = [i, j]
                }
                else if (firstZero !== null && NumArr[i][j].value !== 0) {
                    // 非零和第一个0位交换位置
                    NumArr[firstZero[0]][firstZero[1]].value = NumArr[i][j].value
                    NumArr[i][j].value = 0
                    // 如果相同，合并设0
                    if (firstZero[1] !== 0 && NumArr[firstZero[0]][firstZero[1]].value === NumArr[firstZero[0]][firstZero[1] - 1].value) {
                        NumArr[firstZero[0]][firstZero[1] - 1] = { value: NumArr[firstZero[0]][firstZero[1]].value << 1, changed: true, double: true }
                        NumArr[firstZero[0]][firstZero[1]].value = 0
                        // 移动动画效果
                        this.translateAnimation(i, j, firstZero[0], firstZero[1] - 1)
                    } else {
                        // 移动动画效果
                        this.translateAnimation(i, j, firstZero[0], firstZero[1])
                        // 不同再改变firstZero
                        j = firstZero[1] - 1
                        firstZero = null
                    }
                }
                else if (firstZero === null && NumArr[i][j].value !== 0 && j !== 0 && NumArr[i][j].value === NumArr[i][j - 1].value) {
                    // 判断相等累加合并
                    NumArr[i][j - 1] = { value: NumArr[i][j - 1].value << 1, changed: true, double: true }
                    NumArr[i][j].value = 0

                    // 移动动画效果
                    this.translateAnimation(i, j, i, j - 1)

                    firstZero = [i, j]

                }
            }
        }
    }
    moveRight() {
        let NumArr = this.NumArr
        // 先去0, 再判断相加
        for (let i = 0; i < 4; i++) {
            let firstZero = null
            for (let j = 3; j >= 0; j--) {
                if (firstZero === null && NumArr[i][j].value === 0) {
                    firstZero = [i, j]
                }
                else if (firstZero !== null && NumArr[i][j].value !== 0) {
                    // 非零和第一个0位交换位置
                    NumArr[firstZero[0]][firstZero[1]].value = NumArr[i][j].value
                    NumArr[i][j].value = 0
                    // 如果相同，合并设0
                    if (firstZero[1] !== 3 && NumArr[firstZero[0]][firstZero[1]].value === NumArr[firstZero[0]][firstZero[1] + 1].value) {
                        NumArr[firstZero[0]][firstZero[1] + 1].value = NumArr[firstZero[0]][firstZero[1]].value << 1
                        NumArr[firstZero[0]][firstZero[1] + 1].double = true
                        NumArr[firstZero[0]][firstZero[1]].value = 0
                        // 移动动画效果
                        this.translateAnimation(i, j, firstZero[0], firstZero[1] + 1)
                    } else {
                        // 移动动画效果
                        this.translateAnimation(i, j, firstZero[0], firstZero[1])
                        // 不同再改变firstZero
                        j = firstZero[1] + 1
                        firstZero = null
                    }
                }
                else if (firstZero === null && NumArr[i][j].value !== 0 && j !== 3 && NumArr[i][j].value === NumArr[i][j + 1].value) {
                    // 判断相等累加合并
                    NumArr[i][j + 1].value = NumArr[i][j + 1].value << 1
                    NumArr[i][j + 1].double = true
                    NumArr[i][j].value = 0

                    // 移动动画效果
                    this.translateAnimation(i, j, i, j + 1)
                    firstZero = [i, j]
                }
            }
        }
    }
    moveDown() {
        let NumArr = this.NumArr
        // 先去0, 再判断相加 O(n^2)
        for (let j = 0; j < 4; j++) {
            let firstZero = null
            let changedArr = [[, , ,], [, , ,], [, , ,], [, , ,]]
            for (let i = 3; i >= 0; i--) {
                if (firstZero === null && NumArr[i][j].value === 0) {
                    firstZero = [i, j]
                }
                else if (firstZero !== null && NumArr[i][j].value !== 0) {
                    // 非零和第一个0位交换位置
                    NumArr[firstZero[0]][firstZero[1]].value = NumArr[i][j].value
                    NumArr[i][j].value = 0

                    // 如果相同，合并设0
                    if (firstZero[0] !== 3 && NumArr[firstZero[0]][firstZero[1]].value === NumArr[firstZero[0] + 1][firstZero[1]].value) {
                        NumArr[firstZero[0] + 1][firstZero[1]].value = NumArr[firstZero[0]][firstZero[1]].value << 1
                        NumArr[firstZero[0]][firstZero[1]].value = 0
                        NumArr[firstZero[0] + 1][firstZero[1]].double = true
                        // 移动动画效果
                        this.translateAnimation(i, j, firstZero[0] + 1, firstZero[1])
                    } else {
                        // 移动动画效果
                        this.translateAnimation(i, j, firstZero[0], firstZero[1])
                        // 不同再改变firstZero
                        i = firstZero[0] + 1
                        firstZero = null
                    }
                }
                else if (firstZero === null && NumArr[i][j].value !== 0 && i !== 3 && NumArr[i][j].value === NumArr[i + 1][j].value) {
                    // 判断相等累加合并
                    NumArr[i + 1][j].value = NumArr[i + 1][j].value << 1
                    NumArr[i + 1][j].double = true
                    NumArr[i][j].value = 0
                    // 移动动画效果
                    this.translateAnimation(i, j, i + 1, j)
                    firstZero = [i, j]
                }
            }
        }
    }
    moveUp() {
        let NumArr = this.NumArr
        // 先去0, 再判断相加
        for (let j = 0; j < 4; j++) {
            let firstZero = null
            for (let i = 0; i < 4; i++) {
                if (firstZero === null && NumArr[i][j].value === 0) {
                    firstZero = [i, j]
                }
                else if (firstZero !== null && NumArr[i][j].value !== 0) {
                    // 非零和第一个0位交换位置
                    NumArr[firstZero[0]][firstZero[1]].value = NumArr[i][j].value
                    NumArr[i][j].value = 0
                    // 如果相同，合并设0
                    if (firstZero[0] !== 0 && NumArr[firstZero[0]][firstZero[1]].value === NumArr[firstZero[0] - 1][firstZero[1]].value) {
                        NumArr[firstZero[0] - 1][firstZero[1]].value = NumArr[firstZero[0]][firstZero[1]].value << 1
                        NumArr[firstZero[0] - 1][firstZero[1]].double = true
                        NumArr[firstZero[0]][firstZero[1]].value = 0
                        // 移动动画效果
                        this.translateAnimation(i, j, i - 1, j)
                    } else {
                        // 移动动画效果
                        this.translateAnimation(i, j, firstZero[0], firstZero[1])
                        // 不同再改变firstZero
                        i = firstZero[0] - 1
                        firstZero = null
                    }
                }
                else if (firstZero === null && NumArr[i][j].value !== 0 && i !== 0 && NumArr[i][j].value === NumArr[i - 1][j].value) {
                    // 判断相等累加合并
                    NumArr[i - 1][j].value = NumArr[i - 1][j].value << 1
                    NumArr[i - 1][j].double = true
                    NumArr[i][j].value = 0
                    // 移动动画效果
                    this.translateAnimation(i, j, i - 1, j)
                    firstZero = [i, j]
                }
            }
        }
    }
    translateAnimation(fromI, fromJ, toI, toJ) {
        const el = this.ceils[fromI * 4 + fromJ].children[0]
        el.style.top = `${(toI - fromI) * (this.ceilWidth + 8)}px`
        el.style.left = `${(toJ - fromJ) * (this.ceilWidth + 8)}px`
    }
    scaleAnimation(i, j, time = 0) {
        const that = this
        setTimeout(function () {
            that.ceils[i * 4 + j].children[0].style.transform = 'scale(1)'
        }, time)
    }
    // 判断是否还有空位
    blank() {
        let ranPosArr = []
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (!this.NumArr[i][j].value) {
                    ranPosArr.push([i, j])
                }
            }
        }
        if (ranPosArr.length === 0) return false
        return ranPosArr
    }
    // 判断游戏是否结束
    gameOver() {
        // 先判断是否还有空位
        if (this.blank()) return true

        const NumArr = this.NumArr
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let arr = [
                    i > 0 ? NumArr[i - 1][j].value : 0,
                    i < 3 ? NumArr[i + 1][j].value : 0,
                    j > 0 ? NumArr[i][j - 1].value : 0,
                    j < 3 ? NumArr[i][j + 1].value : 0
                ]
                if (arr.indexOf(NumArr[i][j].value) + 1) {
                    return true
                }
            }
        }
        return false
    }
}
