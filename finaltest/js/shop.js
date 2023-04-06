
function dragStartHandler(e) {
    e.dataTransfer.setData("text/plain", e.target.id);
    return true;
}

function dragenterHandler(e) {
    e.preventDefault();
}

function dragoverHandler(e) {
    e.preventDefault();
}

function dropHandler(e) {
    e.preventDefault();
    e.stopPropagation();

    // 拖曳的產品 id
    var elementID = e.dataTransfer.getData("text/plain");  //id	
    console.log('elementID=' + elementID);
    var element = document.getElementById(elementID);  //object		 			 	

    var theTbody = document.getElementById("tbody2");
    var row = document.createElement("tr");

    console.log(localStorage.getItem(elementID));
    if (localStorage.getItem(elementID)) {
        //alert('購物已包含此項目，請直接修改購物車品項數量 !');
        console.log(elementID);
        console.log("loc=" + localStorage[elementID]);
        console.log("get=" + localStorage.getItem(elementID));
        localStorage[elementID] = parseInt(localStorage[elementID]) + 1;

        var hasID = document.getElementById("id" + elementID);
        hasID.value = parseInt(localStorage[elementID]);
        for (var i = 0; i < shopping_list.length; i++) {
            if (shopping_list[i][0] == elementID) {
                // hasIDTotal = shopping_list[i][2] * (hasID.value - 1);
                // console.log("hasID=" + hasID.value);
                // let qty=parseInt(localStorage[elementID])
                // console.log("qty="+qty);
                // console.log("subtotal=" + subtotal)
                hasIDTotal = shopping_list[i][2];
                subtotal += hasIDTotal;
                document.getElementById("idtotal").innerHTML = "小計 : " + subtotal;
            }
        }



    } else {
        let qty = localStorage[elementID] = 1;
        for (var i = 0; i < shopping_list.length; i++) {
            if (shopping_list[i][0] == elementID) {

                var cellID = document.createElement("td");
                var txtID = document.createTextNode(no++);
                cellID.appendChild(txtID);

                var cellName = document.createElement("td");
                var txtName = document.createTextNode(shopping_list[i][1]);
                cellName.appendChild(txtName);

                var cellPrice = document.createElement("td");
                var txtPrice = document.createTextNode(shopping_list[i][2]);
                cellPrice.appendChild(txtPrice);

                var cellImage = document.createElement("td");
                var eleImg = document.createElement("img");  //<img>
                eleImg.setAttribute("src", element.src);     //<img src=...>
                eleImg.setAttribute("class", "thumb");       //<img src=... class='thumb'>
                cellImage.appendChild(eleImg);

                var cellQtyTD = document.createElement("td");
                var cellQty = document.createElement("input");
                cellQty.setAttribute("type", "text");
                cellQty.setAttribute("size", 3);
                cellQty.setAttribute("value", qty);
                cellQty.setAttribute("id", "id" + elementID);
                cellQtyTD.appendChild(cellQty);
                subtotal = parseInt(subtotal) + parseInt(txtPrice.nodeValue);
            }  //if     		
        }  //for

        row.appendChild(cellID);
        row.appendChild(cellImage);
        row.appendChild(cellName);
        row.appendChild(cellPrice);
        row.appendChild(cellQtyTD);

        theTbody.appendChild(row);
    }//else

    document.getElementById("idtotal").innerHTML = "小計 : " + subtotal;

}


fetch('http://127.0.0.1:5501/finaltest/json/shopdetail.json')
    .then(function (response) {
        return response.json();
    })
    .then(function (myJson) {

        const productRow = document.querySelector('#productRow')

        myJson.forEach(element => {
            const div = document.createElement('div');
            div.classList.add('mb-2')

            div.innerHTML = `<div class="product">
                        <img class="w-100" src="../finaltest/image/${element.p_img}" alt="">
                        <h3 class="h4">
                            ${element.p_Name}
                        </h3>
                        <h3 class="h6">
                            ${element.p_describe}
                        </h3>

                        <div class="d-flex justify-content-between align-items-center">
                            <h4 class="h5">${element.p_price}</h4>
                        </div>

                    </div>`


            productRow.append(div)
        });
    });