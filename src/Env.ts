export const env: {
  name: string;
  modelProjectDir: string;
} = (() => {
  if (process.env.ENV === "dev_local")
    // return { name: 'dev_local', modelProjectDir: '../linkToTestProjectDir/.' }
    return {
      name: "dev_local",
      modelProjectDir: "../linkToTestProjectDir/"
      // modelProjectDir: "../../../huadahengxinProjects/fake-device-general"
    };
  if (process.env.ENV === "dev_docker")
    return { name: "dev_docker", modelProjectDir: "/modelProjectDir" };
  else throw new Error("unknown environment");
})();
