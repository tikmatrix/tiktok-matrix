extern crate embed_resource;
fn main() {
    //check product env
    if cfg!(debug_assertions) {
        println!("cargo:rustc-cfg=debug_assertions");
        embed_resource::compile("tiktok-matrix-manifest-dev.rc", embed_resource::NONE);
    } else {
        println!("cargo:rustc-cfg=release_assertions");
        embed_resource::compile("tiktok-matrix-manifest.rc", embed_resource::NONE);
    }
}
