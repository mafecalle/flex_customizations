let selectedTickets: any[] = [];
let zendeskUser: any = {};

export const getSelectedTicket = () => selectedTickets.reduce((highest, current) => 
  (!highest || current.ticketId > highest.ticketId) ? current : highest, null);
export const setSelectedTicket = (ticket: any) => {
  selectedTickets.push(ticket);
};

export const clearSelectedTicket = () => {
  selectedTickets = [];
};

export const getZendeskUser = () => zendeskUser;
export const setZendeskUser = (user: any) => {
  zendeskUser = user;
};