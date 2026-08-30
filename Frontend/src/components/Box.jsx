import React from "react";

const Box = ({
    subHeading,
    Heading,
    icon,
    price,
}) => {
    const Icon = icon?.icon;

    return (
        <div className="w-full min-w-0 rounded-2xl border border-gray-300 bg-white p-5">

            <div className="flex items-start justify-between gap-4">

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 whitespace-nowrap">
                        {subHeading}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-gray-800 whitespace-nowrap">
                        {Heading}
                    </h2>

                    {price && (
                        <p className="mt-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                            {price}
                        </p>
                    )}
                </div>

                {/* Icon */}
                {Icon && (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                        <Icon
                            size={22}
                            className={icon.color}
                        />
                    </div>
                )}

            </div>

        </div>
    );
};

export default Box;