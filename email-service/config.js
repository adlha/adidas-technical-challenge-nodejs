const config = {};

config.tokenSecret = 'Ry/Yps5RcylF96PujPrNDX6qa48VYhqwtdhtFl/fM6w=';
config.services = {
  subscriptionService: {
    url: process.env.SUBSCRIPTION_SERVICE_HOSTNAME || 'localhost',
    port: process.env.SUBSCRIPTION_SERVICE_PORT || 3000,
  },
  emailService: {
    url: process.env.EMAIL_SERVICE_HOSTNAME || 'localhost',
    port: process.env.EMAIL_SERVICE_PORT || 3002,
  },
};

module.exports = config;
