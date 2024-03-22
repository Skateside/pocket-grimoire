function augmentJinxes(current, latest) {

    const augmented = JSON.parse(JSON.stringify(current));

    latest.forEach(({ id, jinx }) => {

        const index = augmented.findIndex(({ id: aID }) => aID === id);

        if (index < 0) {

            augmented.push({
                id,
                jinx
            });

            return;

        }

        const aug = augmented[index];

        jinx.forEach(({ id: jinxID, reason }) => {

            const jinxIndex = aug.jinx.findIndex(({ id: jID }) => jID === jinxID);

            if (jinxIndex < 0) {

                aug.jinx.push({
                    id: jinxID,
                    reason
                });

            }

        });

    });

    return augmented;

}

function copyAugmentedJinxes(current) {
    copy(JSON.stringify(augmentJinxes(current, window.json), null, "    "));
}

// This prevents the 29 Chinese jinxes from being lost.
