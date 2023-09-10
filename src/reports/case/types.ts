export type Case = {
  enterprise: {
    name: string;
    address: string;
    id: string;
    repName: string;
    // comments: string;
  };
  inspection: {
    date: string;
    comments: string;
    actions: {
      point: string;
      action: string;
      comment: string;
    }[];
  };
  followups: {
    date: string;
    actions: {
      point: string;
      action: string;
      status: string;
      comment: string;
    }[];
    comments: string;
  }[];
  inspector: {
    name: string;
    // email: string;
  };
  reportDate: Date;
  caseID: string;
  // notificationDate: string;
};
