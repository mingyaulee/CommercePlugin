import helper from "../helper.js";
import scHelper from "./scHelper.js";

export default () => {
    window["helper"] = helper;
    window["scHelper"] = scHelper;
}