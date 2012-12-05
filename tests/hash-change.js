location.hash = '';
var expected = [];
var lastDone;
function update(token) {
  if (!window.mochaPhantomJS && typeof console != 'undefined' && typeof console.log == 'function') console.log(token);
  if (!expected.length) {
    throw new Error('The route ' + token + ' was not expected.');
  }
  var e = expected.shift();
  if (e.token !== token) e.done(new Error('\nExpected: ' + e.token + '\nActual: ' + token + '\n'));
  if (e.end) e.done();
}
function expectNextToken(token, end, done) {
  expected.push({token: token, end: end, done: done})
}
(function defineRoutes(){
  Path.map("#A").enter(function(){
    update("A[enter]");
  }).to(function(){
    update("A[action]");
  }).exit(function(){
    update("A[exit]");
  });
  
  Path.map("#B").to(function(){
    update("B[action]");
  });
  
  Path.map("#B").enter(function(){
    update("B[enter]");
  })
  
  Path.map("#C").to(function(){
    update("C[action]");
  }).exit(function(){
    update("C[exit]");
  });
  
  // No map for #D1 or #D2.  This checks that our rescue method works, and works multiple times in succession.
  
  Path.map("#E/params/:id/parse").to(function(){
    update("E[action](parse id=" + this.params['id'] + ")");
  });
  
  Path.map("#E/params/:id/parse").enter(function(){
    update("E[enter](parse id=" + this.params['id'] + ")");
  });
  
  Path.map("#E/params/:id/check").to(function(){
    update("E[action](check id=" + this.params['id'] + ")");
  });
  
  Path.map("#E/params/:id/check").exit(function(){
    update("E[exit](check id=" + this.params['id'] + ")");
  });
  
  Path.map("#F").enter(function(){
    update("F[enter]");
  }).to(function(){
    update("F[action]");
  });
  
  Path.map("#G").enter(function(){
    update("G[enter 1]");
  }).enter(function(){
    update("G[enter 2]");
  }).enter([
    function(){
      update("G[enter 3]");
    },
    function(){
      update("G[enter 4]");
      return false;
    }
  ]).to(function(){
    update("G[action - NOT HIT]");
  });
  Path.map("#H(/:id_one)(/:id_two)").to(function(){
    var id_one = this.params["id_one"] || "N/A";
    var id_two = this.params["id_two"] || "N/A";
    update("H(one=" + id_one + ", two=" + id_two + ")");
  });
  
  Path.rescue(function(){
      update("RESCUE");
  });
  
  Path.root("#F");
})();

function define(route, tokens, description) {
  describe(route, function () {
    it(description, function (done) {
      for (var i = 0; i < tokens.length - 1; i++) {
        expectNextToken(tokens[i], false, done);
      }
      expectNextToken(tokens[tokens.length - 1], true, done);
      if (route === 'root') Path.listen();
      else if (route === 'back') history.go(-1);
      else location.hash = route;
    });
  });
}

define('root', ['F[enter]', 'F[action]'], 'calls `enter` then `to` method of F, as it is root');
define('#A', ['A[enter]', 'A[action]'], 'calls `enter` then `to` method of A');
define('#B', ['A[exit]', 'B[enter]', 'B[action]'], 'calls `exit` of A then `enter` of B then `to` method of B');
define('#C', ['C[action]'], 'calls `to` of C');
describe('Rescue routes', function () {
  define('#D1', ['C[exit]', 'RESCUE'], 'Rescue a route that wasn\'t found');
  define('#D2', ['RESCUE'], 'Rescue a route that wasn\'t found');
});
define('#E/params/1/parse', ['E[enter](parse id=1)', 'E[action](parse id=1)'], '`enter` and `to` both get param from route parsed');
define('#E/params/2/parse', ['E[enter](parse id=2)', 'E[action](parse id=2)'], '`enter` and `to` both get param from route parsed');
define('#E/params/3/check', ['E[action](check id=3)'], '`enter` and `to` both get param from route parsed');
define('#F', ['E[exit](check id=3)', 'F[enter]', 'F[action]'], '`exit` gets the param from route parsed, `enter` and `to` of F are called')
define('#G', ['G[enter 1]', 'G[enter 2]', 'G[enter 3]', 'G[enter 4]'], 'Enter actions are called in order untill one of them returns false.');
define('#H', ['H(one=N/A, two=N/A)'], 'Optional parameters with only the required part submitted');
define('#H/10', ['H(one=10, two=N/A)'], 'Optional parameters with one optional part submitted');
define('#H/10/20', ['H(one=10, two=20)'], 'Optional parameters two levels deep');
define('back', ['H(one=10, two=N/A)'], 'Test that going back works');