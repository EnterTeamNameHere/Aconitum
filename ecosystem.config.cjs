module.exports = {
    apps: [
        {
            name: "Aconitum",
            script: "./build/main.js",
            instance_var: "INSTANCE_ID",
            env_dev: {
                NODE_ENV: "development",
            },
            env_prod: {
                NODE_ENV: "production",
            },
            time: true,
        },
    ],
};
