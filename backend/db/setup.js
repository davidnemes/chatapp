// This file sets the storage in config to absolute path so db stays fixed
// Has to be in the same directory with config

try {

    const path = require("path")
    const { writeFileSync } = require("fs")
    let pathToConfig = path.join(__dirname, '/config/config.json')
    let config = require(pathToConfig)

    let changed = false
    Object.keys(config).forEach(key => {
        if (config[key].dialect !== "sqlite") {
            return
        }
        changed = true

        let dirs = config[key].storage.split("/")
        let filename = dirs[dirs.length-1]
        let newStorage = path.join(__dirname, filename)
        config[key].storage = newStorage
    })

    writeFileSync(pathToConfig, JSON.stringify(config))
    if(changed) console.log("DB Storage Was Set To Absolute Path");

} catch (err) {
    console.log("Error At Configuring DB Config");
    console.log(err);
}
