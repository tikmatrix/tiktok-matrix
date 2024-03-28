extern crate embed_resource;
fn main() {
    //check product env
    if cfg!(debug_assertions) {
        println!("cargo:rustc-cfg=debug_assertions");
    } else {
        println!("cargo:rustc-cfg=release_assertions");
        embed_resource::compile("tiktok-matrix-manifest.rc", embed_resource::NONE);
    }
}
