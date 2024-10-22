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
    confirmNewCharacter: "Are you sure you want to create a new character? This will delete the current character.",
    newSkillPlaceholder: "Enter new skill name",
    addSkill: "Add Skill"
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
    confirmNewCharacter: "您确定要创建新角色吗？这将删除当前角色。",
    newSkillPlaceholder: "输入新技能名称",
    addSkill: "添加技能"
  }
} as const;

export type Language = keyof typeof translations;
