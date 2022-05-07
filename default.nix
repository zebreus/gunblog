{buildImage ? false , buildBuildImage ? false}:
let
  version = "0.5";

  pinnedPkgs = import (builtins.fetchTarball {
    name = "nixos-unstable";
    url = "https://github.com/nixos/nixpkgs/archive/15dab8cb52f2d98adc4ad2e4958d3abc1fe0849e.tar.gz";
    sha256 = "0kdsk59liblvprx1rwd59v1p9kkaw2mlifbzz64kzp0gybcdpzm7";
  }) {};

  # All system dependencies needed to build the react app
  gunblogEnv = pinnedPkgs.buildEnv{
    name = "gunblog-environment";
    paths = [
      pinnedPkgs.nodejs-17_x
      pinnedPkgs.yarn
      pinnedPkgs.lsof
      pinnedPkgs.coreutils
      pinnedPkgs.moreutils
      pinnedPkgs.gnugrep
      pinnedPkgs.gnused
      pinnedPkgs.git
    ];
  };

  # Only package.json and yarn.lock, to prevent baking all sources into the image
  hostingNodeConfig = builtins.filterSource (p: t: builtins.match ".*/(package.json|yarn.lock)" p != null) ./.;

  # The node_modules directory for the react app
  hostingNodeModules = pinnedPkgs.stdenv.mkDerivation {
    name = "hosting-nodemodules-${version}";
    src = hostingNodeConfig;

    installPhase = ''
      export HOME=$TMP
      mkdir -p $TMP/work
      cp -rT $src $TMP/work
      cd $TMP/work
      export BUILDING_IMAGE=true
      ${pinnedPkgs.yarn}/bin/yarn
      mkdir -p $out/modules/hosting
      mv node_modules $out/modules/hosting
    '';

    buildInputs = [
      gunblogEnv
    ];
  };

  # Docker image containing everything needed for the build
  dockerImage = pinnedPkgs.dockerTools.buildImage {
    name = "buildenv";
    tag = "latest";
    contents = [
      pinnedPkgs.bashInteractive
      pinnedPkgs.coreutils
      pinnedPkgs.firefox
      pinnedPkgs.findutils
      pinnedPkgs.jq
      pinnedPkgs.curl
      pinnedPkgs.cacert
      pinnedPkgs.gnused
      pinnedPkgs.gnugrep
      pinnedPkgs.python
      gunblogEnv
      hostingNodeModules
      ( pinnedPkgs.writeShellScriptBin "entrypoint.sh" ''
        # All directories with a package.json
        POSSIBLE_DIRS=$(find / -type d \( -name node_modules -o -name bin -o -name etc -o -name dev -o -name proc -o -name share -o -name sys -o -name nix -o -name nix-support -o -name Users \) -prune -o -name package.json -print | xargs -n1 dirname)

        # Find the correct directory and link the node modules
        for DIRECTORY in $POSSIBLE_DIRS
        do
          if $(jq '.name == "gunblog-app"' "$DIRECTORY/package.json")
          then
            echo "Linking gunblog node_modules to $DIRECTORY"
            ln -s /modules/hosting/node_modules $DIRECTORY/node_modules || true
            ln -s /modules/functions/node_modules $DIRECTORY/functions/node_modules || true
          fi
        done

        # Run normally with bash
        exec bash "$@"
      '' )
    ];
    config = {
      Env = [ "PATH=/modules/hosting/node_modules/.bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" ];
      Entrypoint = [ "/bin/sh" "-c" "/bin/entrypoint.sh" ];
    };
  };

  nixFromDockerHub = pinnedPkgs.dockerTools.pullImage {
    imageName = "nixos/nix";
    imageDigest = "sha256:d9bb3b85b846eb0b6c5204e0d76639dff72c7871fb68f5d4edcfbb727f8a5653";
    sha256 = "1shzn6vzvxhix96zpbi879wn9qd3ndfi0m6rkyw21r9qv3b3mz8s";
    finalImageTag = "2.3.12";
    finalImageName = "nix";
  };

  # Docker image containing everything needed to run the build image CI task
  buildbuildimage = pinnedPkgs.dockerTools.buildLayeredImage {
    name = "buildbuildimage";
    tag = "latest";
    fromImage = nixFromDockerHub;
    contents = [
      pinnedPkgs.skopeo
      pinnedPkgs.jq
    ];
    config = {
      Env = [ "PATH=/root/.nix-profile/bin:/nix/var/nix/profiles/default/bin:/nix/var/nix/profiles/default/sbin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" "USER=root" ];
    };
  };

  # Array with all derivation that will be created
  toBuild = [gunblogEnv] ++ ( if buildImage then [ dockerImage ] else [ ] ) ++ ( if buildBuildImage then [ buildbuildimage ] else [ ] );
in
toBuild
