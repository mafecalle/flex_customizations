let selectedTicket: any = {};
let zendeskUser: any = {};

export const getSelectedTicket = () => selectedTicket;
export const setSelectedTicket = (ticket: any) => {
  selectedTicket = ticket;
};

export const clearSelectedTicket = () => {
  selectedTicket = {};
};

export const getZendeskUser = () => zendeskUser;
export const setZendeskUser = (user: any) => {
  zendeskUser = user;
};