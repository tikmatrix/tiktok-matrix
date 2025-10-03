fn main() {
    // 从环境变量读取分发商代码,默认为 OFFICIAL
    let distributor_code =
        std::env::var("DISTRIBUTOR_CODE").unwrap_or_else(|_| "OFFICIAL".to_string());

    // 将分发商代码嵌入到编译中
    println!("cargo:rustc-env=DISTRIBUTOR_CODE={}", distributor_code);
    println!("cargo:rerun-if-env-changed=DISTRIBUTOR_CODE");

    tauri_build::build()
}
