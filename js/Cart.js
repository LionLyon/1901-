$(function () {
    class Cart {
        constructor() {
            this.goodsBox = $('#goods');
            this.inputNum = $('.numbuy');

            //开始初始化
            this.init()

            console.log(localStorage.getItem("trolley"));

        }

        init() {
            //开始绘制购物车页面
            this.Drawing();
            $('.windup').click((e) => {
                e.preventDefault();
                alert("你有钱吗,你就点?")
            })
        }

        Drawing() {
            let trolley = null;
            if (!localStorage.getItem("trolley")) {
                this.goodsBox.append("<p>你的购物车还是空空如也呢</p>");
                this.goodsBox.css({borderBottom: "1px solid #e0e0e0", height: 112})
                //↑↑↑↑以上判断cookie trolley是否不存在 如果不存在 进行一下操作
            } else {
                //如果cookie > trolley存在 转换并且覆盖存储
                trolley = JSON.parse(localStorage.getItem("trolley"))
                //获取数据完毕 开始渲染页面
                let counter = 0;    //判断forEach循环是否进行到了最后一次
                trolley.forEach((value, index) => {
                    console.log(value);
                    $.ajax({
                        type: 'get',
                        url: '../JSON/goods.json',
                        dataType: 'jsonp',
                        error: res => {
                            //只会返回一项因为上面参数只提交了一项
                            //获取到之后放到goods里

                            let goods = JSON.parse(res.responseText);
                            // console.log(goods);
                            //购物车列表循环绘制
                            let html = `
                                        <div class="goods" goodsid="${goods[value.id].id}">
                                            <div class="goods-info">
                                                <img src="${goods[value.id].pic}" alt="">
                                                <div>
                                                    <span>${goods[value.id].title}</span>
                                                </div>
                                            </div>
                                            <div class="unit_price">
                                                <span>¥${goods[value.id].price}</span>
                                                <span>¥${goods[value.id].marketPrice}</span>
                                            </div>
                                            <div class="count">
                                                <div>
                                                    <a href="#" class="vipFont btn_num_de"></a>
                                                    <input type="number" value="${value.amount}" class="numbuy" min="1">
                                                    <a href="#" class="vipFont btn_num_add"></a>
                                                </div>
                                            </div>
                                            <div class="subtotal">
                                                <span>¥${goods[value.id].price * value.amount}</span>
                                            </div>
                                            <div class="operation">
                                                <a href="#">删除</a>
                                            </div>
                                        </div>`
                            this.goodsBox.append(html);
                            /**
                             * 每次foeEach之后都累加次数
                             * 当次数等于需循环次数的时候就开始
                             * 给元素添加事件
                             */
                            counter++;
                            if (counter == trolley.length) {
                                //网页渲染完毕,然后开始给 购物车的加减按钮开始写事件
                                this.Btn_AD();
                                this.GrossAmount();
                            }
                        }
                    })

                })
            }
        }

        /**
         * 循环各个元素组 添加各种事件
         */
        Btn_AD() {
            let _this = this
            $('.numbuy').keyup(function (e) {
                _this.CalcPrice($(e.target).val(), $(".numbuy").index(this))
            })
            $(".btn_num_de").click(function (e) {
                e.preventDefault();
                if ($(e.target).next().val() <= 1) {
                    $(".btn_num_de").attr('disabled', true)
                    $(".btn_num_de").addClass('disabled')
                    return
                }
                //获取输入框里的值-1 之后复制给这个输入框
                $(e.target).next().val($(e.target).next().val() - 1)

                _this.CalcPrice($(e.target).next().val(), $(".btn_num_de").index(this))

            })
            $(".btn_num_add").click(function (e) {
                    e.preventDefault();
                    //获曲输入框的值 +1 之后复制给这个输入框
                    $(e.target).prev().val(+$(e.target).prev().val() + 1)
                    if ($(e.target).prev().val() > 1) {
                        $(".btn_num_de").attr('disabled', false)
                        $(".btn_num_de").removeClass('disabled')
                    }
                    _this.CalcPrice($(e.target).prev().val(), $(".btn_num_add").index(this))

                }
            )

            this.Delete();

        }

        /**
         * 计算小计价格
         * 接受2个参数  购买数量 和 当前项(接收一个下标)
         * @param buyCount
         * @param count_this
         * @constructor
         */
        CalcPrice(buyCount, count_this) {
            //计算出
            let price = $('.unit_price')[count_this].children[0].innerText.substr(1)
            if (buyCount <= 0) {
                alert("要么删,要么就≥1 别给我写个0")
                $($(".numbuy")[count_this]).val(1);//重置数量框的值为1
                $($('.subtotal')[count_this]).children().html('¥' + price); //计算价格
                return
            }
            if (buyCount > 99) {
                alert("这么有钱?")
                $($(".numbuy")[count_this]).val(99);//重置数量框的值为99
                $($('.subtotal')[count_this]).children().html('¥' + price * 99);
                return
            }

            $($('.subtotal')[count_this]).children().html('¥' + price * buyCount);

            this.Amend(buyCount);
        }

        Delete() {
            let _this = this

            $(".operation a").click(function (e) {
                e.preventDefault()
                let goods = JSON.parse(localStorage.getItem("trolley"))
                $(this).parents(".goods").remove()
                let goodsId = $(this).parents(".goods").attr("goodsid")
                // let goodsSize = $(this).parents(".goods").attr("goodssize")
                goods.forEach((value, index) => {
                    if (value.id == goodsId) {
                        goods.splice(index, 1)
                    }
                })
                if (goods.length == 0) {
                    localStorage.clear();
                    _this.Drawing();        //因为购物车为空了所以直接重新渲染页面 (反正直接出现空空如也的)
                } else {
                    localStorage.setItem('trolley', JSON.stringify(goods))
                }

                _this.GrossAmount()
            })
        }

        /**
         * 修改cookie
         *
         * 先获取cookie 转换之后开始遍历这个cookie
         * 拿它的size和productID两个值与DOM中的两个值进行比较
         * 如果搜索到2个项都相同,则修改他的amount为DOM中最新的值
         * @param buyCount
         * @constructor
         */
        Amend(buyCount) {
            let trolley = JSON.parse(localStorage.getItem("trolley"));
            trolley.forEach((value) => {
                $('.goods').each((values) => {
                    let size = $($('.goods')[values]).find(".goods-info>div>span:nth-child(2)").html().substr(3)
                    let id = $($('.goods')[values]).find(".goods-info>div>span:nth-child(3)").html()
                    if (value.Size == size && value.productId == id) {
                        value.amount = +$($('.goods')[values]).find(".numbuy").val()
                    }
                })
            })
            //循环结束后就可以写入cookie了 当然是直接覆盖的
            localStorage.setItem('trolley', JSON.stringify(trolley))
            //然后可以开始计算总价格了
            this.GrossAmount();
        }

        /**
         * 总价格计算
         * 初始化总价格为0
         * 然后遍历DOM中的小计  累加它的价格 最后写入到总价那个div里
         * @constructor
         */
        GrossAmount() {
            let grossAmount = 0
            $('.subtotal>span').each(value => {
                grossAmount += +$($('.subtotal>span')[value]).html().substr(1)
            })
            $("#grossAmount").html('¥' + grossAmount)
        }
    }

    new Cart();
})