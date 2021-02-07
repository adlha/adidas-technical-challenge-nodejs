const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('njwt');
const SubscriptionCollection = require('../model/SubscriptionCollection');
const app = require('../app');
const {tokenSecret} = require('../config');
const {waterfall} = require('async');

function generateToken() {
  const claims = {iss: 'subscription-service-test', sub: 'subscriptionServiceTest'};
  const token = jwt.create(claims, tokenSecret);
  token.setExpiration(new Date().getTime() + 60*1000);
  return token;
};

let subCreatedId;
let testCreatedId;
subscriptionColl = new SubscriptionCollection();
chai.use(chaiHttp);
chai.should();

before((done) => {
  const subscription = {
    email: 'test@example.com',
    firstName: 'name',
    gender: 'F',
    dateOfBirth: '1990-10-10',
    newsletterId: 'idCKVbyVOAivWLar',
    consentFlag: true,
  };
  subscriptionColl.createSubscription(subscription, (err, result) => {
    if (err) {
      done(err);
    } else {
      subCreatedId = result.subscriptionId;
      done();
    }
  });
});

describe('Subscriptions', () => {
  describe('Without token', () => {
    it('GET all subscriptions should return 401', (done) => {
      chai.request(app)
          .get('/subscriptions')
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
    });

    it('GET subscription should return 401', (done) => {
      chai.request(app)
          .get(`/subscriptions/${subCreatedId}`)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
    });

    it('POST subscription should return 401', (done) => {
      const subTest = {
        email: 'test1@example.com',
        firstName: 'name',
        gender: 'F',
        dateOfBirth: '1990-10-10',
        newsletterId: 'idCKVbyVOAivWLad',
        consentFlag: true,
      };
      chai.request(app)
          .post('/subscriptions')
          .send(subTest)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
    });

    it('DELETE subscription should return 401', (done) => {
      const id = 'test';
      chai.request(app)
          .delete(`/subscriptions/${id}`)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
    });
  });

  describe('POST /', () => {
    it('Should create new subscription', (done) => {
      const subTest = {
        email: 'test@example.com',
        firstName: 'name',
        gender: 'F',
        dateOfBirth: '1990-10-10',
        newsletterId: 'idCKVbyVOAivWLad',
        consentFlag: true,
      };
      chai.request(app)
          .post('/subscriptions')
          .set({'Authorization': `Bearer ${generateToken().compact()}`})
          .send(subTest)
          .end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            testCreatedId = res.body.subscriptionId;
            done();
          });
    });

    it('Should not create new subscription', (done) => {
      chai.request(app)
          .post('/subscriptions')
          .set({'Authorization': `Bearer ${generateToken().compact()}`})
          .send({firstName: 'test', gender: 'F'})
          .end((err, res) => {
            res.should.have.status(400);
            done();
          });
    });
  });

  describe('GET /', () => {
    it('Should get all subscriptions', (done) => {
      chai.request(app)
          .get('/subscriptions')
          .set({'Authorization': `Bearer ${generateToken().compact()}`})
          .end((err, res) => {
            res.should.have.status(200);
            res.body.subscriptions.should.be.a('array');
            done();
          });
    });

    it('Should get single subscription', (done) => {
      chai.request(app)
          .get(`/subscriptions/${subCreatedId}`)
          .set({'Authorization': `Bearer ${generateToken().compact()}`})
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            done();
          });
    });

    it('Should not return subscription', (done) => {
      const id = 'test';
      chai.request(app)
          .get(`/subscriptions/${id}`)
          .set({'Authorization': `Bearer ${generateToken().compact()}`})
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
    });
  });

  describe('DELETE /', () => {
    it('Should delete subscription', (done) => {
      chai.request(app)
          .delete(`/subscriptions/${subCreatedId}`)
          .set({'Authorization': `Bearer ${generateToken().compact()}`})
          .end((err, res) => {
            res.should.have.status(204);
            done();
          });
    });

    it('Should not delete subscription', (done) => {
      const id = 'test';
      chai.request(app)
          .get(`/subscriptions/${id}`)
          .set({'Authorization': `Bearer ${generateToken().compact()}`})
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
    });
  });
});

after((done) => {
  waterfall([
    (nextW) => {
      subscriptionColl.deleteSubscription(subCreatedId, nextW);
    },
    (res, nextW) => {
      subscriptionColl.deleteSubscription(testCreatedId, nextW);
    },
  ], done);
});
