#!/usr/bin/env bash
# Résout VERSION, le tag de build et le SHA pour GitHub Actions.
set -euo pipefail
export LC_ALL=C

fail() { printf '%s\n' "$1" >&2; exit 1; }
tag=$(printf '%s' "${INPUT_TAG:-}" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
if [[ -z $tag ]]; then
    tag=$(sed 's/^[[:space:]]*//;s/[[:space:]]*$//' VERSION)
fi
[[ $tag =~ ^[A-Za-z0-9_][A-Za-z0-9_.-]{0,79}$ ]] || fail 'Tag invalide (80 caractères maximum).'
: "${GITHUB_OUTPUT:?GITHUB_OUTPUT requis}"

if [[ ${BUILD_METADATA:-false} == true ]]; then
    [[ $tag =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?$ ]] || fail 'VERSION doit être une version sémantique, par exemple 1.0.0.'
    [[ ${GITHUB_RUN_NUMBER:-} =~ ^[0-9]+$ && ${GITHUB_RUN_ATTEMPT:-} =~ ^[0-9]+$ ]] || fail 'Numéro ou tentative du build invalide.'
    [[ ${GITHUB_SHA:-} =~ ^[a-f0-9]{40,64}$ ]] || fail 'SHA GitHub invalide.'
    build_tag="$tag-build.$GITHUB_RUN_NUMBER.$GITHUB_RUN_ATTEMPT"
    [[ ${#build_tag} -le 128 ]] || fail 'Tag de build trop long.'
    printf 'tag=%s\nbuild_tag=%s\nsha_tag=sha-%s\n' "$tag" "$build_tag" "$GITHUB_SHA" >> "$GITHUB_OUTPUT"
else
    printf 'tag=%s\n' "$tag" >> "$GITHUB_OUTPUT"
fi
