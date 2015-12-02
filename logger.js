var bunyan = require('bunyan');
module.exports = bunyan.createLogger({
                  name: 'codeadvent2015',
                  streams: [
                      {
                          level: 'info',
                          path: './codeadvent2015.log'
                      }
                  ]
                 });