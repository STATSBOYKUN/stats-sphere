// components/Skeletons.tsx
import React from 'react';

export function DataTableSkeleton() {
    return (
        <div className="h-full w-full p-4 animate-pulse">
            {/* Header skeleton */}
            <div className="flex mb-4">
                <div className="h-8 w-24 bg-gray-200 rounded mr-2"></div>
                <div className="h-8 w-24 bg-gray-200 rounded mr-2"></div>
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
            </div>

            {/* Table skeleton */}
            <div className="border border-gray-200 rounded">
                {/* Table header */}
                <div className="flex border-b border-gray-200 bg-gray-100">
                    <div className="w-12 h-10 p-2 border-r border-gray-200"></div>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex-1 h-10 p-2 border-r border-gray-200">
                            <div className="h-6 bg-gray-200 rounded w-full"></div>
                        </div>
                    ))}
                </div>

                {/* Table rows */}
                {Array.from({ length: 10 }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex border-b border-gray-200">
                        <div className="w-12 h-10 p-2 border-r border-gray-200 bg-gray-50">
                            <div className="h-6 bg-gray-200 rounded w-8"></div>
                        </div>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex-1 h-10 p-2 border-r border-gray-200">
                                <div className="h-6 bg-gray-200 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function VariableTableSkeleton() {
    return (
        <div className="h-full w-full p-4 animate-pulse">
            {/* Table skeleton */}
            <div className="border border-gray-200 rounded">
                {/* Table header */}
                <div className="flex border-b border-gray-200 bg-gray-100">
                    <div className="w-12 h-10 p-2 border-r border-gray-200"></div>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex-1 h-10 p-2 border-r border-gray-200">
                            <div className="h-6 bg-gray-200 rounded w-full"></div>
                        </div>
                    ))}
                </div>

                {/* Table rows */}
                {Array.from({ length: 8 }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex border-b border-gray-200">
                        <div className="w-12 h-10 p-2 border-r border-gray-200 bg-gray-50">
                            <div className="h-6 bg-gray-200 rounded w-8"></div>
                        </div>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex-1 h-10 p-2 border-r border-gray-200">
                                <div className="h-6 bg-gray-200 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ResultsSkeleton() {
    return (
        <div className="p-6 space-y-8 animate-pulse">
            {/* Sidebar skeleton - will be hidden on small screens */}
            <div className="hidden md:block fixed top-16 left-0 w-64 h-full border-r border-gray-200 bg-white p-4">
                <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-6 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>

            {/* Result cards */}
            <div className="md:ml-64">
                {Array.from({ length: 2 }).map((_, cardIndex) => (
                    <div key={cardIndex} className="mb-8">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>

                            {/* Chart placeholder */}
                            <div className="h-64 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                                <div className="h-48 w-5/6 bg-gray-200 rounded"></div>
                            </div>

                            {/* Table placeholder */}
                            <div className="border border-gray-200 rounded">
                                <div className="flex border-b border-gray-200 bg-gray-100">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="flex-1 h-10 p-2 border-r border-gray-200">
                                            <div className="h-6 bg-gray-200 rounded w-full"></div>
                                        </div>
                                    ))}
                                </div>
                                {Array.from({ length: 3 }).map((_, rowIndex) => (
                                    <div key={rowIndex} className="flex border-b border-gray-200">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="flex-1 h-10 p-2 border-r border-gray-200">
                                                <div className="h-6 bg-gray-200 rounded w-full"></div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SidebarSkeleton() {
    return (
        <div className="bg-white border-r h-full animate-pulse">
            <div className="flex items-center justify-between p-3 border-b">
                <div className="h-6 bg-gray-200 rounded w-24"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="p-3 space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-6 bg-gray-200 rounded w-full"></div>
                ))}
            </div>
        </div>
    );
}