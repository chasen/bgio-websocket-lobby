export let entry: string;
export let mode: string;
export namespace output {
    let path: string;
    let filename: string;
    let libraryTarget: string;
}
export namespace module {
    let rules: ({
        test: RegExp;
        exclude: RegExp;
        use: {
            loader: string;
            options: {
                presets: string[];
            };
        };
    } | {
        test: RegExp;
        use: string;
        exclude: RegExp;
    })[];
}
export namespace resolve {
    let extensions: string[];
}
