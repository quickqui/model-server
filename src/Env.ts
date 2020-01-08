export const env: {
  name: string;
  modelProjectDir: string;
  servicePort: number;
} = (() => {
  if (process.env.ENV === "dev_local")
    // return { name: 'dev_local', modelProjectDir: '../linkToTestProjectDir/.' }
    return {
      name: "dev_local",
      modelProjectDir: "../linkToTestProjectDir/",
      servicePort: 1111
      // modelProjectDir: "../../../huadahengxinProjects/fake-device-general"
    };
  if (process.env.ENV === "dev_docker")
    return {
      name: "dev_docker",
      modelProjectDir: "/modelProjectDir",
      servicePort: 1111
    };
  //NOTE 作为外部资源运行，一般只发生在调试model-editor之类的组件时。
  if (process.env.ENV === "dev_outer")
    return {
      name: "dev_outer",
      modelProjectDir: "../prototype",
      servicePort: 1112
    };
  else throw new Error("unknown environment");
})();
