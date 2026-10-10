// ignore_for_file: file_names

import 'package:flutter/material.dart';

import '../../../core/proxy/generated/CoreProxyModels.g.dart' as core_proxy;

class CommonNetworkErrorView extends StatelessWidget {
  const CommonNetworkErrorView({
    super.key,
    this.errorDetails,
    this.errorText,
  });

  final core_proxy.CoreProxyErrorDetails? errorDetails;
  final String? errorText;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;
    final summary = NetworkErrorSummary.fromDetails(errorDetails, errorText);

    return Semantics(
      liveRegion: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colorScheme.errorContainer.withValues(alpha: 0.34),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: colorScheme.error.withValues(alpha: 0.18),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Icon(
                summary.icon,
                size: 20,
                color: colorScheme.error,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      summary.title,
                      style: textTheme.titleSmall?.copyWith(
                        color: colorScheme.onErrorContainer,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      summary.message,
                      style: textTheme.bodySmall?.copyWith(
                        color: colorScheme.onErrorContainer,
                        height: 1.35,
                      ),
                    ),
                    if (summary.detail != null) ...<Widget>[
                      const SizedBox(height: 6),
                      Text(
                        summary.detail!,
                        style: textTheme.bodySmall?.copyWith(
                          color: colorScheme.onErrorContainer.withValues(
                            alpha: 0.74,
                          ),
                          height: 1.35,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class NetworkErrorSummary {
  const NetworkErrorSummary({
    required this.title,
    required this.message,
    required this.icon,
    this.detail,
  });

  final String title;
  final String message;
  final String? detail;
  final IconData icon;

  /// Converts structured runtime error details into a visible summary.
  factory NetworkErrorSummary.fromDetails(
    core_proxy.CoreProxyErrorDetails? details,
    String? text,
  ) {
    final statusCode = details?.httpStatus;
    final remoteMessage =
        details?.remoteMessage ??
        details?.stringField('value') ??
        details?.message ??
        text;

    if (statusCode == 400) {
      return NetworkErrorSummary(
        title: 'Invalid request parameters',Invalid request parameters',Invalid request parameters',Invalid request parameters',Invalid request parameters',Invalid request parameters',
        message: 'The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',The server rejected this model list request. Check that the service URL matches the provider.',
        detail: remoteMessage,
        icon: Icons.tune_rounded,
      );
    }

    if (statusCode == 401) {
      return NetworkErrorSummary(
        title: 'API key verification failed',API key verification failed',API key verification failed',API key verification failed',API key verification failed',API key verification failed',
        message: 'The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',The API key failed provider verification. Paste the full key again and fetch the models.',
        detail: remoteMessage,
        icon: Icons.key_off_rounded,
      );
    }

    if (statusCode == 403) {
      return NetworkErrorSummary(
        title: 'Access denied',Access denied',Access denied',Access denied',Access denied',Access denied',
        message: 'The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',The current key is not allowed to access this provider API. Confirm account permissions and that the model service is enabled.',
        detail: remoteMessage,
        icon: Icons.lock_outline_rounded,
      );
    }

    if (statusCode == 404) {
      return NetworkErrorSummary(
        title: 'Service URL unavailable',Service URL unavailable',Service URL unavailable',Service URL unavailable',Service URL unavailable',Service URL unavailable',Service URL unavailable',
        message: 'No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',No model list endpoint was found at the current service URL. Check that the path is correct.',
        detail: remoteMessage,
        icon: Icons.link_off_rounded,
      );
    }

    if (statusCode == 429) {
      return NetworkErrorSummary(
        title: 'Too many requests',Too many requests',Too many requests',Too many requests',Too many requests',Too many requests',
        message: 'The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',The provider is rate-limiting requests. Fetch the models again later.',
        detail: remoteMessage,
        icon: Icons.hourglass_top_rounded,
      );
    }

    if (statusCode != null && statusCode >= 500) {
      return NetworkErrorSummary(
        title: 'Provider service error',Provider service error',Provider service error',Provider service error',Provider service error',Provider service error',Provider service error',
        message: 'The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',The provider cannot process the model list request right now. Try again later.',
        detail: remoteMessage,
        icon: Icons.cloud_off_rounded,
      );
    }

    if (details?.variant == 'ModelListFetch') {
      return NetworkErrorSummary(
        title: 'Failed to fetch model list',Failed to fetch model list',Failed to fetch model list',Failed to fetch model list',Failed to fetch model list',Failed to fetch model list',Failed to fetch model list',Failed to fetch model list',
        message: 'The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',The model list returned by the provider could not be retrieved. Check the service URL, API key, and network connection.',
        detail: remoteMessage,
        icon: Icons.wifi_off_rounded,
      );
    }

    if (details?.kind == 'network') {
      return NetworkErrorSummary(
        title: 'Network connection failed',Network connection failed',Network connection failed',Network connection failed',Network connection failed',Network connection failed',
        message: 'Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',Could not connect to the model provider. Check the network connection and service URL.',
        detail: remoteMessage,
        icon: Icons.wifi_off_rounded,
      );
    }

    if (details?.variant == 'ModelAlreadyExists') {
      final duplicateDetails = details!;
      final modelId = duplicateDetails.stringField('modelId')!;
      final providerName = duplicateDetails.stringField('providerName')!;
      return NetworkErrorSummary(
        title: 'Model already exists',Model already exists',Model already exists',Model already exists',Model already exists',
        message: 'Model "$modelId" has already been added to provider "$providerName".',Model "$modelId" has already been added to provider "$providerName".',Model "$modelId" has already been added to provider "$providerName".'," has already been added to provider "$providerName".'," has already been added to provider "$providerName".'," has already been added to provider "$providerName".'," has already been added to provider "$providerName".'," has already been added to provider "$providerName".'," has already been added to provider "$providerName".'," has already been added to provider "$providerName".'," has already been added to provider "$providerName".',".',
        icon: Icons.info_outline_rounded,
      );
    }

    return NetworkErrorSummary(
      title: 'Model configuration failed',Model configuration failed',Model configuration failed',Model configuration failed',Model configuration failed',Model configuration failed',
      message: 'An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',An error occurred while fetching available models. Check the provider, service URL, and API key.',
      detail: remoteMessage,
      icon: Icons.error_outline_rounded,
    );
  }
}
