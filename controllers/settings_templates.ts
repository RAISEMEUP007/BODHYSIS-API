import { Request, Response } from "express";
import SettingsTemplates from "../models/settings/settings_templates";

export async function postSettingsTemplate(req: Request, res: Response) {
  const body = req.body;
  if (!body || body.message) new Error("No data provided");

  try {
    const hasAlreadyCreated =  await SettingsTemplates.findOne({where:{
      type: body.type
    }});

    if(hasAlreadyCreated) res.status(400).json({ message: "This template has already been created" });

   const template =  await SettingsTemplates.create({
      type: body.type,
      message: body.message
    });

    res.status(200).json({ template })
  } catch (error) {
    res.status(400).json({ message: "Something wrong, please try again." });
  }
}

export async function putSettingsTemplate(req: Request, res: Response) {
  const body = req.body;

  if (!body) new Error("No data provided");

  try {
    const template = await SettingsTemplates.update({
      message: body.message
    }, { where: { id: req.body.id } });
    res.status(200).json({ template })
  } catch (error) {
    res.status(400).json({ message: "Something wrong, please try again." });
  }
}

export async function getSettingsTemplate(_: Request, res: Response) {
  try {
    const templates = await SettingsTemplates.findAll();
    res.status(200).json({ templates });
  } catch (error) {
    res.status(400).json({ message: "Something wrong, please try again." });
  }
}

export async function getSettingsTemplateByType(req: Request, res: Response) {
  const typeTemplate = req.params.typeTemplate
  try {
    const template = await SettingsTemplates.findOne({where:{
      type:typeTemplate
    }});
    res.status(200).json({ template });
  } catch (error) {
    res.status(400).json({ message: "Something wrong, please try again." });
  }
}