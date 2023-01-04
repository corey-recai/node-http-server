import * as fs from "fs";
import * as path from "path";

type Create = (
  dir: string,
  file: string,
  data: {},
  callback: (err: string | boolean) => void
) => void;

// base directory of data folder
const baseDir = path.join(__dirname, "/../../.data");

export const create: Create = (dir, file, data, callback) => {
  console.log(`${baseDir}/${dir}/${file}.json`);
  fs.open(`${baseDir}/${dir}/${file}.json`, "wx", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      fs.writeFile(fileDescriptor, JSON.stringify(data, null, 2), err => {
        if (!err) {
          fs.close(fileDescriptor, err => {
            if (!err) {
              callback(false);
            } else {
              callback("Error closing the new file.");
            }
          });
        } else {
          callback("Error creating the new file.");
        }
      });
    } else {
      console.error(err);
      callback("Could not create the file, it may already exist.");
    }
  });
};
