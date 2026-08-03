export function createRightElement({ handleDeleteProduct }) {
  const element = document.createElement("div");
  element.className = "rightBlock col-md-9 d-none d-md-block";
  element.innerHTML = /* HTML */ `
    <div id="setting"></div>
    <div class="content form-data overflow-y-auto overflow-x-hidden">
      <!------ RETAIL FORM ------->
      <div class="tab-content" id="retailform">
        <div
          class="form-row row justify-content-between"
          style="background-color: #FCFBE0"
        >
          <span class="col-auto">
            Product name
            <input type="text" name="Product" style="width: 500px;"
          /></span>
          <span class="col-auto">
            <button class="btn btn-default delete">
              <i class="bi bi-trash"></i>Delete
            </button>
          </span>
        </div>
        <!-- EDITING.HTML -->
        <div class="tab-content" id="editing" style="padding: 5px">
          <div class="row mb-3 product_image" id="retail-form"></div>
          <div id="create-variation"></div>

          <div class="row mb-3">
            <div class="col-md-12">
              <div class="card">
                <div class="card-header">Instruction</div>
                <div class="card-body" style="height: 200px">
                  <textarea
                    name="Instruction"
                    class="form-control Instruction h-100"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          <!------ product image ------->
          <div id="images"></div>
          <div>
            <div class="store-listing-link-container">
              <div>
                <span>
                  <label>Amazon</label>
                  <input
                    class="store-listing-link amazon_code"
                    name="StoreListingASIN[amazon][0]"
                    id="amazon"
                    type="text"
                  />
                  <input
                    class="amazon_UpdatedOn"
                    name="StoreListingASIN[amazon][1]"
                    id="amazon_UpdatedOn"
                    type="text"
                    value=""
                  />
                  <a
                    href="javascript:void(0);"
                    data-hreflink=""
                    id="amazon_link"
                    >EDIT</a
                  >
                  <a href="" id="amazon_preview" target="_blank">Preview</a>
                </span>
              </div>
              <div>
                <span>
                  <label>Ebay</label>
                  <input
                    class="store-listing-link ebay_code"
                    name="StoreListingASIN[ebay][0]"
                    id="ebay"
                    type="text"
                  />
                  <input
                    class="ebay_UpdatedOn"
                    name="StoreListingASIN[ebay][1]"
                    id="ebay_UpdatedOn"
                    type="text"
                    value=""
                  />
                  <a href="javascript:void(0);" data-hreflink="" id="ebay_link"
                    >EDIT</a
                  >
                  <a href="" id="ebay_preview" target="_blank">Preview</a>
                </span>
              </div>
              <div>
                <span>
                  <label>Etsy</label>
                  <input
                    class="store-listing-link etsy_code"
                    name="StoreListingASIN[etsy][0]"
                    id="etsy"
                    type="text"
                  />
                  <input
                    class="etsy_UpdatedOn"
                    name="StoreListingASIN[etsy][1]"
                    id="etsy_UpdatedOn"
                    type="text"
                    value=""
                  />
                  <a href="javascript:void(0);" data-hreflink="" id="etsy_link"
                    >EDIT</a
                  >
                  <a href="" id="etsy_preview" target="_blank">Preview</a></span
                >
              </div>
              <div class="d-flex" style="gap: 5px; align-items: start;">
                <span>Bodi For Life</span>
                <a href="" class="bodi4lifeUrl" target="_blank">Preview</a>
                <div class="bodi4life">
                  <span>
                    <select
                      class="retail-switch"
                      name="StoreListingASIN[bodi4life][]"
                    >
                      <option value="Off">Deactived</option>
                      <option value="Active">Active</option>
                    </select>
                    <!-- <input name="StoreListingASIN[bodi4life][]" class="retail-date" id="bodi4life_UpdatedOn" type="text" value=""> -->
                  </span>
                </div>
                <div class="category">
                  <div class="subcategories" data-order="First"></div>
                  <div style="clear:both"></div>
                </div>
              </div>
              <div></div>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-12">
              <div class="card">
                <div class="card-header">Description</div>
                <div class="card-body">
                  <article
                    class="text-value Description editable restricted-product-check"
                    name="Description"
                    contenteditable="true"
                  ></article>
                </div>
              </div>
            </div>
          </div>
          <div class="form-row" style="background-color: #FCFBE0">
            <div>Fix Comments</div>
            <div>
              <textarea name="FixComments" style="width:100%"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  element.toggle = (isShow) => {
    if (isShow) {
      element.querySelector(".content").classList.remove("d-none");
    } else {
      element.querySelector(".content").classList.add("d-none");
    }
  };
  element.update = ({ product }) => {
    let e = $(element);
    let proName = product.Product.replace(/\ /g, "_").replace(/\%/g, "");
    let bodi4lifeUrl =
      "https://bodi4life.com/products/" +
      product.category +
      "/" +
      proName +
      ".html";
    e.find(".bodi4lifeUrl").attr("href", bodi4lifeUrl);

    e.find("input[name=Product]").val(product.Product);
    e.find("[name=FixComments]").val(product.FixComments);
    e.find(".Description").html(product.Description);
    e.find(".Instruction").val(product.Instruction);
    if (product.StoreListingASIN) {
      if (Array.isArray(product.StoreListingASIN.amazon)) {
        var amazonCode = product.StoreListingASIN.amazon[0]
          ? product.StoreListingASIN.amazon[0]
          : "";
        var amazon_UpdatedOn = product.StoreListingASIN.amazon[1]
          ? product.StoreListingASIN.amazon[1]
          : "";
      } else {
        var amazonCode = product.StoreListingASIN.amazon
          ? product.StoreListingASIN.amazon
          : "";
        var amazon_UpdatedOn = "";
      }
      e.find(".amazon_code").val(amazonCode);
      e.find(".amazon_UpdatedOn").val(amazon_UpdatedOn);
      e.find("#amazon_link").attr(
        "data-hreflink",
        "https://catalog.amazon.com/abis/product/DisplayEditProduct?marketplaceID=ATVPDKIKX0DER&ref=xx_myiedit_cont_myifba&sku=VG-LT4M-5004&asin=" +
          amazonCode,
      );

      if (Array.isArray(product.StoreListingASIN.ebay)) {
        var ebayCode = product.StoreListingASIN.ebay[0]
          ? product.StoreListingASIN.ebay[0]
          : "";
        var ebay_UpdatedOn = product.StoreListingASIN.ebay[1]
          ? product.StoreListingASIN.ebay[1]
          : "";
      } else {
        var ebayCode = product.StoreListingASIN.ebay
          ? product.StoreListingASIN.ebay
          : "";
        var ebay_UpdatedOn = "";
      }
      e.find(".ebay_code").val(ebayCode);
      e.find(".ebay_UpdatedOn").val(ebay_UpdatedOn);
      e.find("#ebay_link").attr(
        "data-hreflink",
        "https://bulksell.ebay.com/ws/eBayISAPI.dll?SingleList&sellingMode=ReviseItem&lineId=" +
          ebayCode,
      );

      if (Array.isArray(product.StoreListingASIN.etsy)) {
        var etsyCode = product.StoreListingASIN.etsy[0]
          ? product.StoreListingASIN.etsy[0]
          : "";
        var etsy_UpdatedOn = product.StoreListingASIN.etsy[1]
          ? product.StoreListingASIN.etsy[1]
          : "";
      } else {
        var etsyCode = product.StoreListingASIN.etsy
          ? product.StoreListingASIN.etsy
          : "";
        var etsy_UpdatedOn = "";
      }
      e.find(".etsy_code").val(etsyCode);
      e.find(".etsy_UpdatedOn").val(etsy_UpdatedOn);
      e.find("#etsy_link").attr(
        "data-hreflink",
        "https://www.etsy.com/your/shops/BodiStore/tools/listings/sort:title,order:ascending/" +
          etsyCode,
      );

      /* preview link start */
      e.find("#amazon_preview").attr(
        "href",
        "https://www.amazon.com/dp/" + amazonCode,
      );
      e.find("#ebay_preview").attr(
        "href",
        "https://www.ebay.com/itm/" + ebayCode,
      );
      e.find("#etsy_preview").attr(
        "href",
        "https://www.etsy.com/listing/" + etsyCode,
      );
      /* preview link end */
      if (Array.isArray(product.StoreListingASIN.bodi4life)) {
        $(".bodi4life .retail-switch").val(
          product.StoreListingASIN.bodi4life[0],
        );
      }
    } else {
      let linktbl = $(".store-listing-link-container");
      linktbl.find("input").val("");
      linktbl.find("a").attr("href", "#");
    }
  };
  element.clear = () => {
    let e = $(element);
    e.find("input[name=Product]").val("");
    e.find("[name=FixComments]").val("");
    e.find(".Description").html("");
    e.find(".Instruction").val("");
    e.find(".store-listing-link input").val("");
  };
  //event
  element.querySelector(".delete").addEventListener("click", async (e) => {
    element.querySelector(".delete .bi").className =
      "bi spinner-border spinner-border-sm";
    let result = await handleDeleteProduct();
    element.querySelector(".delete .bi").className = "bi bi-trash";
  });
  return element;
}
