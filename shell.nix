with import <nixpkgs> {};
let
  gunblogEnv = ( builtins.head (import ./default.nix {}) );
in
mkShell {
  buildInputs = [
    gunblogEnv
  ];
  shellHook = ''
    export PATH=${toString ./.}/node_modules/.bin:$PATH
    yarn install
  '';
}
