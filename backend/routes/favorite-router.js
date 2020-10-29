"use strict";

const createError = require("http-errors");
const HttpConfig = require("../configs/http-config");
const express = require("express");
const getCategoryModel = require("../models/category");
const getAccountModel = require("../models/account");
const getDealModel = require("../models/deal");

const router = express.Router();
