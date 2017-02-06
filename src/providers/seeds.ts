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

  public static LABELS = {
    person: "Acteur",
    organization: "Equipe",
    competence: "Rôle",
    event: "Rencontre",
    project: "Chantier",
    action: "Action",
    creativeWork: "Ressource",
    product: "Service",
    idea: "Idée",
    concept: "Etiquette",
    schema: "Schéma"
  };

  public static readonly ORDERED = [
    {type: Seeds.ORGANIZATION, label: "Equipe"}, {type: Seeds.PROJECT, label: "Chantier"}, {type: Seeds.PRODUCT, label: "Service"},
    {type: Seeds.PERSON, label: "Acteur"}, {type: Seeds.EVENT, label: "Rencontre"}, {type: Seeds.CREATIVE_WORK, label: "Ressource"},
    {type: Seeds.COMPETENCE, label: "Rôle"}, {type: Seeds.ACTION, label: "Action"}, {type: Seeds.IDEA, label: "Idée"},
  ];
}
