export class CheckFilter extends HTMLElement {
  active = false;
  connectedCallback() {
    this.innerHTML = "<button>check</button>";

    this.handleClick = this.handleClick.bind(this);
    this.addEventListener("click", this.handleClick);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.handleClick);
  }

  handleClick() {
    if (this.active) {
      this.active = false;
      $(".products .item").show();
      this.classList.remove("active");
    } else {
      this.active = true;
      $(".products .item").each(function () {
        if (this.querySelector(".check").checked == true) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
      this.classList.add("active");
    }
  }
}
