export class Seeds {

  public static readonly PERSON = 'person';
  public static readonly ORGANIZATION = 'organization';
  public static readonly COMPETENCE = 'competence';
  public static readonly EVENT = 'event';
  public static readonly PROJECT = 'project';
  public static readonly ACTION = 'action';
  public static readonly CREATIVE_WORK = 'creativeWork';
  public static readonly PRODUCT = 'product';
  public static readonly IDEA = 'idea';
  public static readonly CONCEPT = 'concept';
  public static readonly SCHEMA = 'schema';

  public static readonly CONCEPT_TYPE = {
    type: Seeds.CONCEPT, label: "Etiquette", synonyms: ["tag"]
  };

  public static readonly ORDERED = [
    {type: Seeds.ORGANIZATION, label: "Equipe", synonyms: ["structure", "communauté"]},
    {type: Seeds.PROJECT, label: "Chantier", synonyms: ["projet", "programme"]},
    {type: Seeds.PRODUCT, label: "Service", synonyms: ["prestation"]},
    {type: Seeds.PERSON, label: "Acteur", synonyms: ["personne", "utilisateur"]},
    {type: Seeds.EVENT, label: "Rencontre", synonyms: ["réunion", "événement", "séminaire"]},
    {type: Seeds.CREATIVE_WORK, label: "Ressource", synonyms: ["documentation", "équipement"]},
    {type: Seeds.COMPETENCE, label: "Rôle", synonyms: ["fonction", "compétence"]},
    {type: Seeds.ACTION, label: "Action", synonyms: ["tâche"]},
    {type: Seeds.IDEA, label: "Idée", synonyms: []}
  ];

  public static allSeedsTypes() {
    return [Seeds.CONCEPT_TYPE].concat(Seeds.ORDERED);
  }

  public static readonly SCOPE_PUBLIC = 'public';
  public static readonly SCOPE_PRIVATE = 'private';
  public static readonly SCOPE_APIDAE = 'apidae';
  public static readonly SCOPE_ALL = 'all';
}
