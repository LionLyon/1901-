$(function () {
    class ShowDetails {
        constructor() {
            this.inputNum = $('#numbuy');
            this.btn_addCart = $(".btn_add")
            this.hasSize = true;     //是否有尺码
            this.init()
        }

        init() {
            this.Processing()
        }

        Processing() {
            let url = location.href;
            url = url.split("?")[1].split("&");
            this.id = url[0].split("=")[1]
            // this.productId = url[1].split("=")[1]
            console.log(this.id);
            let _this = this
            $.ajax({
                url: '../JSON/goods.json',
                dataType: 'jsonp',
                error: res => {
                    _this.goods = JSON.parse(res.responseText)[this.id]
                    _this.ShowDetails()
                    // this.loadLittleNav()
                }
            })
        }

        ShowDetails() {
            let _this = this;
            // console.log(this);
            document.title = this.goods.title;    //标题
            $('h3').text(this.goods.title);       //商品名称
            this.goods.smallImage = this.goods.pic;
            $('#view').html(`<img src="${this.goods.smallImage}" alt="">`); //商品图片

            //#region 商品价格等等
            let strPrice_box = `
                        <div class="price">
                            <span class="price_rise">¥<b>${this.goods.price}</b></span>
                        </div>
                        <div class="discount_box">
                            <span class="pbox_off">${this.goods.discount}</span>
                            <span class="pbox_market">¥${this.goods.marketPrice}</span>
                        </div>`
            $('.price_box').append(strPrice_box);
            //#endregion
            _this._bind() //开始给各个按钮添加事件
        }

        _bind() {
            //按钮 -  事件
            $(".btn_num_de").click((e) => {
                e.preventDefault();
                //如果输了小于等于1就禁用按钮- 并且添加一下样式
                if (this.inputNum.val() <= 1) {
                    $(".btn_num_de").attr('disabled', true)
                    $(".btn_num_de").addClass('disabled')
                    return
                }
                // 给输入框赋 (输入框的内容-1)
                this.inputNum.val(this.inputNum.val() - 1)
            })
            $(".btn_num_add").click((e) => {
                e.preventDefault();

                this.inputNum.val(+this.inputNum.val() + 1)
                if (this.inputNum.val() > 1) {
                    $(".btn_num_de").attr('disabled', false)
                    $(".btn_num_de").removeClass('disabled')
                }
            })

            $('.size ul').click((e) => {
                e.preventDefault();
                $(e.target).parent().addClass('active').siblings().removeClass('active')
                $('.size').css({border: "0"})
            })

            //添加到购物袋 按钮事件
            this.btn_addCart.click((e) => {
                e.preventDefault();

                // let buySize = -1;       //如果该商品没有size 就赋个-1
                let thisBuy = {}
                // /**
                //  *  如果有size属性就获取用户选择size
                //  *      如果没有选择 就给个红框框 并且return
                //  */
                //
                // if (this.hasSize) {
                //     buySize = $('.size ul li[class="active"]').text()
                // }
                //
                // if (buySize == "") {
                //     $('.size').css({border: "1px solid red"})
                //     return
                // } else {
                let buyNum = this.inputNum.val()
                thisBuy = {
                    id: this.goods.id,
                    // brandId: this.goods.brandId,
                    // Size: buySize,
                    amount: +buyNum
                }
                // }

                this.addTrolley(thisBuy)
            })


        }

        //添加到购物车
        addTrolley(thisBuy) {
            if (!localStorage.getItem('trolley')) {
                localStorage.setItem('trolley', `[${JSON.stringify(thisBuy)}]`);
            } else {
                let trolley = JSON.parse(localStorage.getItem('trolley'));
                let isRepet = false
                trolley.forEach(value => {
                    if (value.id === thisBuy.id) {
                        value.amount = value.amount + thisBuy.amount;
                        localStorage.setItem('trolley', JSON.stringify(trolley));
                        isRepet = true;
                    }
                })

                if (!isRepet) {
                    trolley.push(thisBuy)
                    localStorage.setItem('trolley', JSON.stringify(trolley));
                }
            }
            alert("添加成功")
            // $("header").load("Header.html", function () {
            //     $('.logos').remove()
            // })
        }
    }

    new ShowDetails()


})