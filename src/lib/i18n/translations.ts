export const translations = {
  en: {
    base: "Base",
    occupation: "Occupation",
    interest: "Interest",
    growth: "Growth",
    skills: "Skills",
    save: "Save",
    cancel: "Cancel",
    editSkills: "Edit Skills",
    totalOccupationPoints: "Total Occupation Points",
    totalInterestPoints: "Total Interest Points",
    editAttributes: "Edit Attributes",
    attributes: "Attributes",
    derivedAttributes: "Derived Attributes",
    createNewCharacter: "Create New Character",
    importCharacter: "Import Character",
    exportCharacter: "Export Character",
    loadingCharacterData: "Loading character data...",
  },
  cn: {
    base: "基础",
    occupation: "职业",
    interest: "兴趣",
    growth: "成长",
    skills: "技能",
    save: "保存",
    cancel: "取消",
    editSkills: "编辑技能",
    totalOccupationPoints: "总职业点数",
    totalInterestPoints: "总兴趣点数",
    editAttributes: "编辑属性",
    attributes: "属性",
    derivedAttributes: "衍生属性",
    createNewCharacter: "创建新角色",
    importCharacter: "导入角色",
    exportCharacter: "导出角色",
    loadingCharacterData: "正在加载角色数据...",
  }
} as const;

export type Language = keyof typeof translations;
