import mongoose from 'mongoose';
import autoinc  from 'mongoose-id-autoinc';
import logger  from '../website/server/libs/logger';
import nconf    from 'nconf';
import repl     from 'repl';
import gulp     from 'gulp';

// Add additional properties to the repl's context
let improveRepl = (context) => {
  // Let "exit" and "quit" terminate the console
  ['exit', 'quit'].forEach((term) => {
    Object.defineProperty(context, term, { get () {
      process.exit();
    }});
  });

  // "clear" clears the screen
  Object.defineProperty(context, 'clear', { get () {
    process.stdout.write('\u001B[2J\u001B[0;0f');
  }});

  context.Challenge = require('../website/server/models/challenge').model; // eslint-disable-line global-require
  context.Group     = require('../website/server/models/group').model; // eslint-disable-line global-require
  context.User      = require('../website/server/models/user').model; // eslint-disable-line global-require

  const isProd = nconf.get('NODE_ENV') === 'production';
  const mongooseOptions = !isProd ? {} : {
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  };
  autoinc.init(
    mongoose.connect(
      nconf.get('NODE_DB_URI'),
      mongooseOptions,
      (err) => {
        if (err) throw err;
        logger.info('Connected with Mongoose');
      }
    )
  );
};

gulp.task('console', () => {
  improveRepl(repl.start({
    prompt: 'Habitica > ',
  }).context);
});
