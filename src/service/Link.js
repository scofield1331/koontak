class Link {
    getProductName() {
        let pathname = window.location.pathname.split("/").pop()
        return pathname.replace('.html', '').replace(/_/g, ' ')
    }
}
export default Link;